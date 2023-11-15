import {UserRepository} from "../repositories/user-repository";
import {PostRepository} from "../repositories/post-repository";
import * as schema from "./schema";
import {db} from "../services/async-storage/db";
import cacheFactory from "../services/cache-factory";
import {InferSelectModel} from "drizzle-orm";
import {VerificationRepository} from "../repositories/verification-repository";
import {eventEmitter} from "../services/event-emitter";
import {collectionStorage} from "../services/collection-storage";


const repository = {
	user: new UserRepository(
		schema.user,
		db,
		eventEmitter,
		collectionStorage,
		cacheFactory<InferSelectModel<typeof schema.user>>(10),
		cacheFactory<any>(30)
	),
	post: new PostRepository(
		schema.post,
		db,
		eventEmitter,
		collectionStorage,
		cacheFactory<InferSelectModel<typeof schema.post>>(10),
		cacheFactory<any>(30)
	),
	verification: new VerificationRepository(
		schema.verification,
		db,
		eventEmitter,
		collectionStorage
	)
};

export default repository;