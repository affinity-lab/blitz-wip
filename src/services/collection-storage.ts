import {CollectionStorage} from "../lib/storage/collection-storage";
import cfg from "./config";
import {db} from "./async-storage/db";
import {storage} from "../app/schema";

export const collectionStorage = new CollectionStorage(
	cfg.storage.path,
	db,
	storage
);