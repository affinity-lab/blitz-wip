import NodeCache from "node-cache";
import BlitzCache from "../lib/blitz-cache/blitz-cache";
import CacheWithNodeCache from "../lib/blitz-cache/cache-with-node-cache";


const cache = new NodeCache();
//const blitz-cache = new Redis(process.env.REDIS_URL as string);

export default function cacheFactory<T = any>(ttl: number = 10): BlitzCache | undefined {
    return new CacheWithNodeCache<T>(cache, ttl);
    // return new CacheWithRedis<T>(blitz-cache, ttl);
}