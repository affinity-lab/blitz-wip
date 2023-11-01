import NodeCache, {ValueSetItem} from "node-cache";
import Cache, {type KeyValue} from "./cache.js";


export default class CacheWithNodeCache<T = any> extends Cache<T> {
	constructor(private cache: NodeCache, ttl: number, prefix?: string) {
		super(ttl, prefix);
	}

	get(key: string | number): Promise<T | undefined>;
	get(keys: Array<string | number>): Promise<Array<T>>;
	get(key: string | number | Array<string | number>): Promise<T | undefined | Array<T>> {
		return Promise.resolve(
			Array.isArray(key)
			? Object.values(this.cache.mget(this.key(key))) as Array<T>
			: this.cache.get(this.key(key)) as T
		);
	}

	set(item: KeyValue<T>, ttl?:number): Promise<void> ;
	set(items: Array<KeyValue<T>>, ttl?:number): Promise<void>;
	set(items: KeyValue<T> | Array<KeyValue<T>>, ttl?:number): Promise<void> {
		if(ttl === undefined) ttl = this.ttl;
		if (Array.isArray(items)) {
			const setWithTTL: Array<ValueSetItem<T>> = items.map(item => {return {key: this.key(item.key), val: item.value, ttl};});
			this.cache.mset(setWithTTL);
		} else {
            const item= items;
			this.cache.set(this.key(item.key), item.value, ttl);
		}
		return Promise.resolve();
	}

	del(keys: Array<string | number>): Promise<void>;
	del(key: string | number): Promise<void>;
	del(key: string | number | Array<string | number>): Promise<void> {
		this.cache.del(this.key(key));
		return Promise.resolve();
	}

	clear(): Promise<void> {
		this.cache.flushAll();
		return Promise.resolve();
	}
}