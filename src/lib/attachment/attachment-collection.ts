import AttachmentEntity from "./attachment-entity";
import {Attachment, Attachments, Entity, File} from "./types";

export type _WRITABLE_AttachmentCollection = {
	attachmentEntity: AttachmentEntity<any, any>,
	name: string
}

export default class AttachmentCollection {
	protected attachmentEntity: AttachmentEntity<any, any>;
	protected name: string;

	constructor(options?: {}) {}

	async add(id: number, file: File | Array<File>) { await this.attachmentEntity.add(id, this.name, file);}

	async get(id: Array<number>): Promise<Record<number, Attachments>>;
	async get(id: number): Promise<Attachments>;
	async get(id: number | Array<number>) { return await this.attachmentEntity.get(id, this.name);}

	// todo: multiple signatures
	async with(objects: Entity | Array<Entity>, key: string = "attachments") { return await this.attachmentEntity.with(objects, key, this.name);}

	// todo: implement it
	async first(id: Array<number>): Promise<Record<number, Attachment>>;
	async first(id: number): Promise<Attachment | undefined>;
	async first(id: number | Array<number>) { return await this.attachmentEntity.get(id, this.name);}

	// todo: withFirst(objects: Entity | Array<Entity>, key: string = "attachments")


	async purge(id: number) { await this.attachmentEntity.purge(id, this.name);}

	async delete(id: number, filename: string) { await this.attachmentEntity.delete(id, this.name, filename);}

	async rename(id: number, from: string, to: string) { await this.attachmentEntity.rename(id, this.name, from, to);}

	async position(id: number, filename: string, position: number) {await this.attachmentEntity.position(id, this.name, filename, position);}
}
