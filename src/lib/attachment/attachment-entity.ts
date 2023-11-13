import {MySqlTable} from "drizzle-orm/mysql-core";
import AttachmentHandler from "./attachment-handler";
import AttachmentCollection, {_WRITABLE_AttachmentCollection} from "./attachment-collection";
import {Collections, Entity, File} from "./types";
import {getTableName} from "drizzle-orm";

type TCollection<COLL> = keyof COLL;
type TCollections<COLL> = Array<TCollection<COLL>>;
type TMaybeArrayCollection<COLL> = TCollection<COLL> | TCollections<COLL>;

function filterObject(data: Record<string, any>, keys?: Array<string>) {
	if (keys === undefined) return data;
	return Object.keys(data)
				 .filter(key => keys.includes(key))
				 .reduce((obj: Record<string, any>, key) => {
					 obj[key] = data[key];
					 return obj;
				 }, {});
}

export default class AttachmentEntity<
	SCHEMA extends MySqlTable = any,
	COLL extends Record<string, AttachmentCollection> = any
> {

	readonly name: string;

	constructor(
		protected readonly attachmentHandler: AttachmentHandler,
		readonly schema: SCHEMA,
		readonly $: COLL,
		name?: string
	) {
		this.name = name === undefined ? getTableName(schema) : name;
		for (const key in $) {
			($[key] as unknown as _WRITABLE_AttachmentCollection).name = key;
			($[key] as unknown as _WRITABLE_AttachmentCollection).attachmentEntity = this;
		}
	}

	get collections(): Array<string> {return Object.keys(this.$);}

	async add(id: number, collection: TCollection<COLL>, file: File) {
		await this.attachmentHandler.add(this, id, collection as string, file);
	}

	async rename(id: number, collection: TCollection<COLL>, from: string, to: string) {
		await this.attachmentHandler.rename(this, id, collection as string, from, to);
	}

	async position(id: number, collection: TCollection<COLL>, filename: string, position: number) {
		await this.attachmentHandler.position(this, id, collection as string, filename, position);
	}

	async purge(id: number) {
		return this.attachmentHandler.purge(this, id);
	}

	async delete(id: number, collection: TMaybeArrayCollection<COLL>, filename: string) {
		return this.attachmentHandler.delete(this, id, collection as string, filename);
	}

	async get(id: number, collection?: TMaybeArrayCollection<COLL>): Promise<Collections>;
	async get(ids: Array<number>, collection?: TMaybeArrayCollection<COLL>): Promise<Record<number, Collections>>;
	async get(ids: number | Array<number>, collection?: TMaybeArrayCollection<COLL>): Promise<Record<number, Collections> | Collections | undefined>;
	async get(ids: number | Array<number>, collection?: TMaybeArrayCollection<COLL>): Promise<Record<number, Collections> | Collections> {
		if (typeof collection === "string") collection = [collection];
		if (Array.isArray(ids)) {
			let res = await this.attachmentHandler.all(this, ids);
			if (collection === undefined) return res;
			for (const key in res) res[key] = filterObject(res[key], collection as Array<string>);
			return res;
		} else {
			let res = await this.attachmentHandler.get(this, ids);
			if (collection === undefined) return res;
			return filterObject(res, collection as Array<string>);
		}
	}


	async with(objects: Entity, key?: string, collection?: TMaybeArrayCollection<COLL>): Promise<Entity> ;
	async with(objects: Array<Entity>, key?: string, collection?: TMaybeArrayCollection<COLL>): Promise<Array<Entity>>;
	async with(objects: Entity | Array<Entity>, key: string, collection?: TMaybeArrayCollection<COLL>): Promise<Array<Entity> | Entity>;
	async with(objects: Entity | Array<Entity>, key: string = "$", collection?: TMaybeArrayCollection<COLL>): Promise<Array<Entity> | Entity> {
		return Array.isArray(objects)
			   ? this.withMulti(objects, key, collection)
			   : this.withSingle(objects, key, collection);
	}

	protected async withSingle(object: Entity, key: string, collection?: TMaybeArrayCollection<COLL>) {
		object[key] = await this.get(object.id, collection);
		return object;
	}

	protected async withMulti(objects: Array<Entity>, key: string, collection?: TMaybeArrayCollection<COLL>) {
		const ids = objects.map((object) => object.id);
		const attachments = await this.get(ids, collection);
		objects.map(object => object[key] = attachments[object.id]);
		return objects;
	}
}