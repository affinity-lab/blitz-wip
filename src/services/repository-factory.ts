import {MySqlRepository} from "@affinity-lab/blitz";
import {MySqlTableWithColumns} from "drizzle-orm/mysql-core";
import {db} from "./async-storage/db";
import {eventEmitter} from "./event-emitter";
import {collectionStorage} from "./collection-storage";
import cacheFactory from "./cache-factory";
import {InferSelectModel} from "drizzle-orm";
import {undefined} from "zod";

export function repositoryFactory<T extends MySqlRepository>(repository: new (...args: any[]) => T, schema: MySqlTableWithColumns<any>, storeTTL?: number, cacheTTL?: number): T {
	return new repository(
		schema,
		db,
		eventEmitter,
		collectionStorage,
		storeTTL ? cacheFactory<InferSelectModel<typeof schema>>(storeTTL) : undefined,
		cacheTTL ? cacheFactory<any>(cacheTTL) : undefined
	);
}