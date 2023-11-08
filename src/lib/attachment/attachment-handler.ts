import {MySqlTable} from "drizzle-orm/mysql-core";
import {Attachments, File} from "./types";

export default class AttachmentHandler<DB extends Record<string, any>, SCHEMA extends MySqlTable, COLL> {
	constructor(
		readonly schema: SCHEMA,
		readonly db: DB,
		readonly path: string
	) {}
	async add(schema: MySqlTable, id: number, collection: string, file: File) {}
	async rename(schema: MySqlTable, id: number, collection: string, from: string, to: string) {}
	async position(schema: MySqlTable, id: number, collection: string, filename: string, position: number) {}
	async delete(schema: MySqlTable, id: number, collection: string, filename: string | Array<string>) {}
	async all(schema: MySqlTable, ids: Array<number>, collection?: string): Promise<Record<number, Attachments>> {}
	async get(schema: MySqlTable, id: number, collection?: string): Promise<Attachments> {}
	async purge(schema: MySqlTable, id: number, collection?: string) {}
}