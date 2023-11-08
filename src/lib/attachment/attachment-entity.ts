import {MySqlTable} from "drizzle-orm/mysql-core";
import AttachmentHandler from "./attachment-handler";
import AttachmentCollection, {_WRITABLE_AttachmentCollection} from "./attachment-collection";
import {Attachments, Entity, File} from "./types";

export default class AttachmentEntity<SCHEMA extends MySqlTable, COLL extends Record<string, AttachmentCollection>> {

	constructor(
		protected readonly attachmentHandler: AttachmentHandler<any, any, any>,
		protected readonly schema: SCHEMA,
		readonly $: COLL
	) {
		for (const key in $) {
			($[key] as unknown as _WRITABLE_AttachmentCollection).name = key;
			($[key] as unknown as _WRITABLE_AttachmentCollection).attachmentEntity = this;
		}
	}

	async add(id: number, collection: keyof COLL, file: File) {
		await this.attachmentHandler.add(this.schema, id, collection as string, file);
	}

	async rename(id: number, collection: keyof COLL, from: string, to: string) {
		await this.attachmentHandler.rename(this.schema, id, collection as string, from, to);
	}

	async position(id: number, collection: keyof COLL, filename: string, position: number) {
		await this.attachmentHandler.position(this.schema, id, collection as string, filename, position);
	}

	async purge(id: number, collection?: keyof COLL) {
		return this.attachmentHandler.purge(this.schema, id, collection as string);
	}

	async delete(id: number, collection: keyof COLL, filename: string) {
		return this.attachmentHandler.delete(this.schema, id, collection as string, filename);
	}

	async get(id: number, collection?: keyof COLL): Promise<Attachments>;
	async get(ids: Array<number>, collection?: keyof COLL): Promise<Record<number, Attachments>>;
	async get(ids: number | Array<number>, collection?: keyof COLL): Promise<Record<number, Attachments> | Attachments | undefined>;
	async get(ids: number | Array<number>, collection?: keyof COLL): Promise<Record<number, Attachments> | Attachments> {
		return Array.isArray(ids)
			   ? this.attachmentHandler.all(this.schema, ids, collection as string)
			   : this.attachmentHandler.get(this.schema, ids, collection as string);
	}


	async with(objects: Entity, key?: string, collection?: keyof COLL): Promise<Entity> ;
	async with(objects: Array<Entity>, key?: string, collection?: keyof COLL): Promise<Array<Entity>>;
	async with(objects: Entity | Array<Entity>, key: string, collection?: keyof COLL): Promise<Array<Entity> | Entity>;
	async with(objects: Entity | Array<Entity>, key: string = "attachments", collection?: keyof COLL): Promise<Array<Entity> | Entity> {
		return Array.isArray(objects)
			   ? this.withAll(objects, key, collection)
			   : this.withOne(objects, key, collection);
	}

	protected async withOne(object: Entity, key: string = "attachments", collection?: keyof COLL) {
		object[key] = await this.get(object.id, collection);
		return object;
	}

	protected async withAll(objects: Array<Entity>, key: string = "attachments", collection?: keyof COLL) {
		const ids = objects.map((object) => object.id);
		const attachments = await this.get(ids, collection);
		objects.map(object => object[key] = attachments[object.id]);
		return objects;
	}
}