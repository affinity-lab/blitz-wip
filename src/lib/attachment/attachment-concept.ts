import {File, TFocus} from "./types";
import {EventEmitter} from "events";
import {Request} from "express";

class Collection {
	add(file: File, title?: string) {}
	get(pattern?: string) {}
	first(pattern?: string) {}
	delete(filename: string) {}
	rename(filename: string, to: string) {}
	setTitle(filename: string, title?: string) {}
	setPosition(filename: string, position?: number) {}
	setFocus(filename: string, focus?: TFocus) {}
}

class MultiCollection {

}

class Handler {

}

type TCollectionBase = Record<string, Collection>;
type THolderDictionary<COLLECTIONS> = { [key in keyof COLLECTIONS]: Collection } & {}
type THolderObject<COLLECTION extends TCollectionBase> = THolderDictionary<COLLECTION> & Holder<COLLECTION>
type THolderFunc<COLLECTIONS extends TCollectionBase> =
	((id: number) => THolderObject<COLLECTIONS>) & {
	multi: (ids: Array<number>) => void
}

function attachmentHolder<COLLECTIONS extends TCollectionBase>
(handler: Handler, collections: COLLECTIONS): THolderFunc<COLLECTIONS> {
	const holderFunc = ((id: number) => {
		return new Holder(id, handler, collections) as THolderObject<COLLECTIONS>;
	}) as THolderFunc<COLLECTIONS>;
	holderFunc.prefetch = (ids: number[]) => {};
	return holderFunc;
}

class Holder<COLLECTIONS extends Record<string, Collection>> {
	constructor(id: number, handler: Handler, collections: COLLECTIONS) {

	}

	attach(obj: {}, key: string) {}

	delete() {}
}

const user_files = attachmentHolder(new Handler(), {
	alfa: new Collection(),
	beta: new Collection()
});

user_files.multi([1, 2, 3]);
user_files(1).alfa.add("file");
user_files(1).beta.get();
user_files(1).beta.first();

user_files(1).delete();
user_files.multi([1, 2, 3]);
user_files.multi([1, 2, 3]);

const eventEmitter = new EventEmitter();
eventEmitter.on("xcom::request-accepted", (req:Request)=>{})
