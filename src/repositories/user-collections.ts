import {DocumentCollection} from "../lib/storage/collections/document";
import {eventEmitter} from "../services/event-emitter";
import repository from "../app/repository";
import {collectionStorage} from "../services/collection-storage";

export const userDocuments = new DocumentCollection(
	"userDocuments",
	eventEmitter,
	repository.user,
	collectionStorage,
	{
		limit: 3,
		size: 1024 * 1024
	}
);