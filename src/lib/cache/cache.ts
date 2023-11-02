import * as crypto from "crypto";


export type KeyValue<T> = { key: string | number, value: T }

export default abstract class Cache<T = any> {
    protected constructor(protected ttl: number, protected prefix?: string) {
        if (this.prefix === undefined) this.prefix = crypto.randomUUID();
    }

    key(keys: Array<string | number>): Array<string>;
    key(key: string | number): string;
    key(key: string | number | Array<string | number>): string | Array<string>;
    key(key: string | number | Array<string | number>): string | Array<string> {
        return Array.isArray(key) ? key.map(k => this.prefix + "." + k.toString()) : this.prefix + "." + key.toString();
    }

    abstract set(item: KeyValue<T>, ttl?: number): Promise<void> ;
    abstract set(items: Array<KeyValue<T>>, ttl?: number): Promise<void>;

    abstract get(key: string | number): Promise<T | undefined>;
    abstract get(keys: Array<string | number>): Promise<Array<T>>;

    abstract del(key: string | number): Promise<void>;
    abstract del(keys: Array<string | number>): Promise<void>;

    abstract clear(): Promise<void>;
}