import cfg from "./config";
import {db} from "./async-storage/db";
import {storage} from "../app/schema";
import {CollectionStorage} from "@affinity-lab/blitz";

export const collectionStorage = new CollectionStorage(
	cfg.storage.path,
	db,
	storage
);