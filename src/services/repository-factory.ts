import {MySqlRepository} from "@affinity-lab/blitz";
import {MySqlTableWithColumns} from "drizzle-orm/mysql-core";
import {db} from "./async-storage/db";
import {eventEmitter} from "./event-emitter";
import {collectionStorage} from "./collection-storage";
import cacheFactory from "./cache-factory";
import {InferSelectModel} from "drizzle-orm";

export function repositoryFactory<T extends MySqlRepository>(repository: new (...args: any[]) => T, schema: MySqlTableWithColumns<any>, storeTTL?: number, cacheTTL?: number): T {
	return new repository(
		schema,
		db,
		eventEmitter,
		collectionStorage,
		storeTTL !== undefined ? cacheFactory<InferSelectModel<typeof schema>>(storeTTL) : undefined,
		cacheTTL !== undefined ? cacheFactory<any>(cacheTTL) : undefined
	);
}