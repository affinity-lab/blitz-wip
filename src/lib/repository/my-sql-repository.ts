import {MySqlTable, MySqlUpdateSetSource, PreparedQuery} from "drizzle-orm/mysql-core";
import {InferInsertModel, InferSelectModel, sql} from "drizzle-orm";
import {MySql2Database, MySqlRawQueryResult} from "drizzle-orm/mysql2";
import Cache, {KeyValue} from "../cache/cache";
import * as crypto from "crypto";
import AttachmentHandler from "./attachment-handler";


export default class MySqlRepository<S extends Record<string, any>, T extends MySqlTable> {

    static cache(ttl?: number): MethodDecorator {
        return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            const func = descriptor.value;
            const id = crypto.randomUUID();
            descriptor.value = async function (...args: Array<any>) {
                const instance = this as unknown as MySqlRepository<any, any>;
                if (instance.cache === undefined) return await func(...args);
                const key = crypto.createHash("md5").update(id + JSON.stringify(args)).digest("hex");
                const item = await instance.cache.get(key);
                if (item !== undefined) return item;
                const result = await func.call(instance, ...args);
                if (result !== undefined) await instance.cache.set({key: key, value: result}, ttl);
                return result;
            };
        };
    }

    static store(): MethodDecorator {
        return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            const func = descriptor.value;
            descriptor.value = async function (...args: Array<any>) {
                const instance = this as unknown as MySqlRepository<any, any>;
                const result = await func.call(instance, ...args);
                if (instance.store && result !== undefined) await instance.store?.set(instance.itemToKeyValue(result));
                return result;
            };
        };
    }

    public readonly attachments: Record<string, AttachmentHandler> = {};
    private baseQueries: Record<string, PreparedQuery<any>> = {};
    protected publicFields: Record<string, any> = {};

    constructor(
        readonly schema: T,
        readonly db: MySql2Database<S>,
        protected store?: Cache<InferSelectModel<T>>,
        protected cache?: Cache<InferSelectModel<T>>,
        excludedFields: Array<string> = []
    ) {
        for (let key of Object.keys(schema)) if (!excludedFields.includes(key)) this.publicFields[key] = (schema as Record<string, any>)[key];
        this.baseQueries = {
            get: this.db.select(this.publicFields).from(schema).where(sql`id = ${sql.placeholder("id")}`).limit(1).prepare(),
            all: this.db.select(this.publicFields).from(schema).where(sql`id IN (${sql.placeholder("ids")})`).prepare(),
            del: this.db.delete(schema).where(sql`id = (${sql.placeholder("id")})`).prepare()
        };
    }

    protected itemToKeyValue(items: Array<InferSelectModel<T>>): Array<KeyValue<InferSelectModel<T>>>;
    protected itemToKeyValue(item: InferSelectModel<T>): KeyValue<InferSelectModel<T>> ;
    protected itemToKeyValue(item: InferSelectModel<T> | Array<InferSelectModel<T>>): KeyValue<InferSelectModel<T>> | Array<KeyValue<InferSelectModel<T>>> {
        if (!Array.isArray(item)) return {key: item.id as number, value: item};
        return item.map((item) => Object({key: item.id, value: item}));
    }

    async get(ids: Array<number>): Promise<Array<InferSelectModel<T>>> ;
    async get(id: number): Promise<InferSelectModel<T> | undefined> ;
    async get(id: number | Array<number>): Promise<InferSelectModel<T> | Array<InferSelectModel<T>> | undefined> {
        if (Array.isArray(id)) return this.all(id);
        return this.store ? this.getFromStoreOrDatabase(id) : this.baseQueries.get.execute({id});
    }

    private async getFromStoreOrDatabase(id: number) {
        // try from store, when exists return
        let item = await this.store!.get(id);
        if (item) return Promise.resolve(item);
        // fetch, store and return
        let res = await this.baseQueries.get.execute({id});
        item = res && res.length ? (res)[0] : undefined;
        if (item) await this.store!.set(this.itemToKeyValue(item));
        return item;
    }

    protected async all(ids: Array<number>): Promise<Array<InferSelectModel<T>>> {
        return this.store ? this.allFromStoreOrDatabase(ids) : this.baseQueries.all.execute({ids});
    }

    private async allFromStoreOrDatabase(ids: Array<number>): Promise<Array<InferSelectModel<T>>> {
        const items = await this.store!.get(ids);
        if (items.length === ids.length) return Promise.resolve(items);		// when all loaded from store return
        let idsToFetch: Array<number>; // get the rest ids to fetch
        if (items.length === 0) {
            idsToFetch = ids;
        } else {
            let itemIds = items.map(item => item.id); // ids of the items we already got
            idsToFetch = ids.filter(id => !itemIds.includes(id));
        }
        const result: Array<InferSelectModel<T>> = [];
        const fetched: Array<InferSelectModel<T>> = await this.baseQueries.all.execute({ids: idsToFetch});
        await this.store!.set(this.itemToKeyValue(fetched));
        result.push(...items, ...fetched);
        return Promise.resolve(result);
    }

    private eventHandlers: Record<string, Array<(...arg: any) => void | Promise<void>>> = {
        beforeInsert: [],
        afterInsert: [],
        beforeUpdate: [],
        afterUpdate: [],
        beforeDelete: [],
        afterDelete: []
    };

    public beforeInsert(func: (values: InferInsertModel<T>) => void) {
        this.eventHandlers.beforeInsert.push(func);
    }

    public afterInsert(func: (id: number, values: InferInsertModel<T>) => void) {
        this.eventHandlers.afterInsert.push(func);
    }

    public beforeUpdate(func: (id: number, values: MySqlUpdateSetSource<T>) => void) {
        this.eventHandlers.beforeUpdate.push(func);
    }

    public afterUpdate(func: (id: number, values: MySqlUpdateSetSource<T>, affectedRows: number) => void) {
        this.eventHandlers.afterUpdate.push(func);
    }

    public beforeDelete(func: (id: number) => void) {
        this.eventHandlers.beforeDelete.push(func);
    }

    public afterDelete(func: (id: number) => void) {
        this.eventHandlers.afterDelete.push(func);
    }

    async insert(values: InferInsertModel<T>): Promise<number | undefined> {
        for (const handler of this.eventHandlers.beforeInsert) await handler(values);
        const res = await this.db.insert(this.schema).values(values);
        const id = res[0].insertId;
        for (const handler of this.eventHandlers.afterInsert) await handler(values);
        return id;
    }

    async update(id: number, values: MySqlUpdateSetSource<T>) {
        await this.store?.del(id);
        for (const handler of this.eventHandlers.beforeUpdate) await handler(id, values);
        const res: MySqlRawQueryResult = await this.db.update(this.schema).set(values).where(sql`id = ${id}`);
        const affectedRows = res[0].affectedRows;
        for (const handler of this.eventHandlers.afterUpdate) await handler(id, values, affectedRows);
        return affectedRows;
    }

    async delete(id: number): Promise<void> {
        await this.store?.del(id);
        for (const handler of this.eventHandlers.beforeDelete) await handler(id);
        const res: MySqlRawQueryResult = await this.baseQueries.del.execute({id});
        const affectedRows = res[0].affectedRows;
        if (affectedRows > 0) for (const key in this.attachments) this.attachments[key].purge();
        for (const handler of this.eventHandlers.afterDelete) await handler(id, affectedRows);
    }
}