import AttachmentEntity from "./attachment-entity";
import {Attachment, AttachmentWithId, Collections, Entity, File} from "./types";

export type _WRITABLE_AttachmentCollection = {
	attachmentEntity: AttachmentEntity<any, any>,
	name: string
}

export default class AttachmentCollection {
	protected attachmentEntity: AttachmentEntity<any, any>;
	protected name: string;

	constructor(options?: {}) {}

	async add(id: number, file: File | Array<File>) { await this.attachmentEntity.add(id, this.name, file);}

	async get(id: Array<number>): Promise<Record<number, Collections>>;
	async get(id: number): Promise<Collections>;
	async get(id: number | Array<number>) { return await this.attachmentEntity.get(id, this.name);}

	async with(object: Entity, key?: string): Promise<Entity>;
	async with(objects: Array<Entity>, key?: string): Promise<Array<Entity>> ;
	async with(objects: Entity | Array<Entity>, key: string = "$"): Promise<Entity | Array<Entity>> {
		return await this.attachmentEntity.with(objects, key, this.name);
	}

	async first(ids: Array<number>): Promise<AttachmentWithId>;
	async first(id: number): Promise<Attachment | undefined>;
	async first(ids: number | Array<number>): Promise<AttachmentWithId | Attachment | undefined>;
	async first(ids: number | Array<number>): Promise<AttachmentWithId | Attachment | undefined> {
		if (Array.isArray(ids)) {
			const collectionsByEntity = await this.attachmentEntity.get(ids, this.name);
			const res: AttachmentWithId = {};
			for (const id in collectionsByEntity) {
				const collection = collectionsByEntity[id][this.name];
				res[id] = collection.length === 0 ? undefined : collection[0];
			}
			return res;
		} else {
			const collections = await this.attachmentEntity.get(ids, this.name);
			const collection = collections[this.name];
			return collection.length === 0 ? undefined : collection[0];
		}
	}

	async withFirst(object: Entity, key: string): Promise<Entity>;
	async withFirst(objects: Array<Entity>, key: string): Promise<Array<Entity>>;
	async withFirst(objects: Entity | Array<Entity>, key: string): Promise<Entity | Array<Entity>> {
		if (Array.isArray(objects)) {
			const firsts = await this.first(objects.map(object => object.id));
			for (const object of objects) object[key] = firsts[object.id];
			return objects;
		} else {
			objects[key] = await this.first(objects.id);
			return objects;
		}
	}

	async delete(id: number, filename: string) {
		await this.attachmentEntity.delete(id, this.name, filename);
	}

	async rename(id: number, from: string, to: string) {
		await this.attachmentEntity.rename(id, this.name, from, to);
	}

	async position(id: number, filename: string, position: number) {
		await this.attachmentEntity.position(id, this.name, filename, position);
	}
}
