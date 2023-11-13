import {MySqlDatabase, MySqlTable} from "drizzle-orm/mysql-core";
import {Collections, File} from "./types";
import {and, sql} from "drizzle-orm";
import BlitzCache from "../blitz-cache/blitz-cache";
import AttachmentEntity from "./attachment-entity";

export default class AttachmentHandler<
	DB extends MySqlDatabase<any, any> = any,
	SCHEMA extends MySqlTable = any
> {
	constructor(
		readonly schema: SCHEMA,
		readonly db: DB,
		readonly path: string,
		readonly cache?: BlitzCache
	) {}

	protected getCacheKey(ae: AttachmentEntity, id: number): string {return `${ae.name}/${id}`;}

	protected async invalidateCache(ae: AttachmentEntity, id: number): Promise<void> {await this.cache?.del(this.getCacheKey(ae, id));}

	protected async fetchSingle(entity: string, id: number) {
		return await this.db.select().from(this.schema).where(
			and(
				sql`entity='${entity}'`,
				sql`entityId=${id}`
			)
		).execute();
	}

	protected async fetchMulti(entity: string, ids: Array<number>) {
		return await this.db.select({data: sql`data`}).from(this.schema).where(
			and(
				sql`entity='${entity}'`,
				sql`entityId in (${ids.join(",")})`
			)
		).execute();
	}

	validateCollections(ae: AttachmentEntity, res: any): Collections | undefined {
		return;
	}

	async get(ae: AttachmentEntity, id: number): Promise<Collections> {
		let fetch = (): Promise<Collections> => this.fetchSingle(ae.name, id);
		const res = (this.cache !== undefined)
					? await this.cache.read(fetch, this.getCacheKey(ae, id))
					: await fetch();
		return this.validateCollections(ae, res);
	}

	async all(ae: AttachmentEntity, ids: Array<number>): Promise<Record<number, Collections>> {

	}

	async add(ae: AttachmentEntity, id: number, collection: string, file: File) {
		await this.invalidateCache(ae, id);
		// todo: get record
		// todo: check file
		// todo: save file
		// todo: insert into collection
		// todo: update record
		// todo: invalidate cache
	}

	async rename(ae: AttachmentEntity, id: number, collection: string, from: string, to: string) {
		await this.invalidateCache(ae, id);
		// todo: get record
		// todo: rename file (maybe filename(1).ext)
		// todo: rename in collection
		// todo: update record
		// todo: invalidate cache
	}

	async position(ae: AttachmentEntity, id: number, collection: string, filename: string, position: number) {
		await this.invalidateCache(ae, id);
		// todo: get record
		// todo: reorder files in collection
		// todo: update record
		// todo: invalidate cache
	}

	async delete(ae: AttachmentEntity, id: number, collection: string, filename: string | Array<string>) {
		// todo: get record
		// todo: delete file
		// todo: remove file from collection
		// todo: update record
		// todo: invalidate cache
	}

	async purge(ae: AttachmentEntity, id: number) {
		await this.invalidateCache(ae, id);
		// todo: remove all files / directories
		// todo: remove record
		// todo: invalidate
	}
}