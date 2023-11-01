import Cache, {type KeyValue} from "./cache.js";
import {Redis} from "ioredis";


export default class CacheWithRedis<T = any> extends Cache<T> {
    constructor(private cache: Redis, ttl: number, prefix?: string) {
        super(ttl, prefix);
    }

    async get(key: string | number): Promise<T | undefined>;
    async get(keys: Array<string | number>): Promise<Array<T>>;
    async get(key: string | number | Array<string | number>): Promise<T | undefined | Array<T>> {
        if (Array.isArray(key)) {
            let res = await this.cache.mget(this.key(key));
            res = res.filter(row => row !== null);
            return res.map(row => JSON.parse(row!)) as Array<T>;
        } else {
            const res = await this.cache.get(this.key(key));
            if (res === null) return undefined;
            return JSON.parse(res) as T;
        }
    }

    async set(item: KeyValue<T>, ttl?: number): Promise<void> ;
    async set(items: Array<KeyValue<T>>, ttl?: number): Promise<void>;
    async set(items: KeyValue<T> | Array<KeyValue<T>>, ttl?: number): Promise<void> {
        if (ttl === undefined) ttl = this.ttl;
        if (Array.isArray(items)) {
            const multi = this.cache.multi();
            for (const item of items) multi.setex(this.key(item.key), ttl, JSON.stringify(item.value));
            return await multi.exec().then();
        } else {
            const item = items;
            return await this.cache.setex(this.key(item.key), ttl, JSON.stringify(item.value)).then();
        }
    }

    async del(keys: Array<string | number>): Promise<void>;
    async del(key: string | number): Promise<void>;
    async del(key: string | number | Array<string | number>): Promise<void> {
        return await this.cache.del(...this.key(key)).then();
    }

    async clear(): Promise<void> {
        return this.cache.flushall().then();
    }
}