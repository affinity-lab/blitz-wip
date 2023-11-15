import NodeCache from "node-cache";
import {Cache, CacheWithNodeCache} from "@affinity-lab/affinity-util";


const cache = new NodeCache();
//const cache = new Redis(process.env.REDIS_URL as string);

export default function cacheFactory<T = any>(ttl: number = 10): Cache | undefined {
    return new CacheWithNodeCache<T>(cache, ttl);
    // return new CacheWithRedis<T>(cache, ttl);
}