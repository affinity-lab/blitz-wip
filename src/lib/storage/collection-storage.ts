import {MySqlTable, PreparedQuery} from "drizzle-orm/mysql-core";
import {MySql2Database} from "drizzle-orm/mysql2";
import BlitzCache from "../blitz-cache/blitz-cache";
import {and, eq, sql} from "drizzle-orm";
import Path from "path";
import fs from "fs";
import {storageError} from "./errors";
import {AttachmentRecord, Attachments, TmpFile} from "./types";

export class CollectionStorage {

	private queries: Record<string, PreparedQuery<any>> = {};

	constructor(
		readonly path: string,
		readonly db: MySql2Database<any>,
		readonly schema: MySqlTable,
		readonly cache?: BlitzCache
	) {
		this.queries = {
			get: this.db.select().from(schema).where(and(
				sql`name = ${sql.placeholder("name")}`,
				sql`itemId = ${sql.placeholder("id")}`
			)).limit(1).prepare(),
			all: this.db.select().from(schema).where(and(
				sql`itemId IN (${sql.placeholder("ids")})`,
				sql`name = ${sql.placeholder("name")}`
			)).prepare(),
			del: this.db.delete(schema).where(and(
				sql`itemId = (${sql.placeholder("id")})`,
				sql`name = ${sql.placeholder("name")}`
			)).prepare()
		};
	}

	protected getPath(name: string, id: number) { return Path.resolve(this.path, name, id.toString(36).padStart(6, "0").match(/.{1,2}/g)!.join("/"));}

	protected key(name: string, id: number): string {return `${name}-${id}`;}

	protected removeStructure(dir: string): void {
		let parent: string = Path.parse(dir).dir;
		let list: string[] = fs.readdirSync(dir);
		if (list.length === 0) {
			fs.rmdirSync(dir);
			this.removeStructure(parent);
		}
	};

	protected sanitizeFilename(filename: string) {
		const extName = Path.extname(filename);
		const fileName = Path.basename(filename, extName);
		return fileName.toLowerCase().trim().replace(/[/\\?%*:|"<>]/g, "-") + extName.toLowerCase().trim();
	}

	protected getUniqueFilename(directory: string, filename: string) {
		const baseName = Path.basename(filename, Path.extname(filename));
		const extName = Path.extname(filename);
		let newName = filename;
		let count = 1;
		while (fs.existsSync(Path.resolve(directory, newName))) {
			newName = `${baseName}(${count})${extName}`;
			count++;
		}
		return newName;
	}

	async get(name: string, id: number, res?: { found?: "db" | "cache" | false }): Promise<Attachments>;
	async get(name: string, id: Array<number>): Promise<Record<number, Attachments>>;
	async get(name: string, id: number | Array<number>): Promise<Attachments | Record<number, Attachments>> ;
	async get(name: string, id: number | Array<number>, res: { found?: "db" | "cache" | false } = {}): Promise<Attachments | Record<number, Attachments>> {
		if (Array.isArray(id)) {
			if (id.length === 0) return [];
			let records: Array<AttachmentRecord>;
			const res: Record<number, Attachments> = {};
			if (this.cache !== undefined) {
				// get available items from cache
				let keys = id.map(id => this.key(name, id));
				records = await this.cache.get(keys);
				for (const i in records) res[records[i].itemId] = JSON.parse(records[i].data);
				// get the rest and set to cache
				const has: Array<number> = records.map(record => record.itemId);
				const need = id.filter(i => !has.includes(i));
				records = await this.queries.all.execute({name, need});
				for (const i in records) res[records[i].itemId] = JSON.parse(records[i].data);
				const toCache = records.map(record => {return {key: this.key(record.name, record.itemId), value: record};});
				await this.cache.set(toCache);
			} else {
				records = await this.queries.all.execute({name, id});
				for (const i in records) res[records[i].itemId] = JSON.parse(records[i].data);
			}
			return res;
		} else {
			//read from cache
			let record: AttachmentRecord | undefined = await this.cache?.get(this.key(name, id));
			if (record !== undefined) {
				res.found = "cache";
				return JSON.parse(record.data);
			}
			//read from db
			const records: Array<AttachmentRecord> = await this.queries.get.execute({name, id});
			if (records && records.length > 0) {
				record = records[0];
				res.found = "db";
				this.cache?.set({key: this.key(name, id), value: record});
				return JSON.parse(record.data);
			}
			res.found = false;
			return [];
		}
	}

	protected async getIndexOfAttachments(name: string, id: number, filename: string, fail: boolean = false) {
		const attachments = await this.get(name, id);
		console.log(attachments);
		const idx = attachments.findIndex(a => a.name === filename);
		if (idx === -1 && fail) throw storageError.attachedFileNotFound(name, id, filename);
		return {attachments, index: idx};
	}

	async destroy(name: string, id: number) {
		this.cache?.del(this.key(name, id));
		await this.queries.del.execute({name, id});
		const path = this.getPath(name, id);
		const files = fs.readdirSync(path);
		files.map(async (file) => fs.unlinkSync(Path.join(path, file)));
		this.removeStructure(path);
	}

	protected async updateRecord(name: string, id: number, attachments: Attachments) {
		this.cache?.del(this.key(name, id));
		await this.db.update(this.schema)
				  .set({data: JSON.stringify(attachments)})
				  .where(
					  and(
						  eq(sql`itemId`, sql.placeholder("id")),
						  eq(sql`name`, sql.placeholder("name"))
					  )
				  )
				  .execute({name, id});
	}

	async add(name: string, id: number, file: TmpFile, metadata: Record<string, any>) {
		let path = this.getPath(name, id);
		let filename = Path.basename(file.file);
		filename = this.sanitizeFilename(filename);
		filename = this.getUniqueFilename(path, filename);
		fs.mkdirSync(path, {recursive: true});
		fs.copyFileSync(file.file, Path.join(path, filename));
		let res: { found?: "db" | "cache" | false } = {};
		const attachments = await this.get(name, id, res);
		attachments.push({
			name: filename,
			size: fs.statSync(file.file).size,
			metadata
		});
		if (res.found === false) {
			await this.db.insert(this.schema).values({name, itemId: id, data: JSON.stringify(attachments)}).execute();
		} else {
			await this.db.update(this.schema).set({data: JSON.stringify(attachments)}).where(and(
				sql`name = ${sql.placeholder("name")}`,
				sql`itemId = ${sql.placeholder("id")}`
			)).execute({name, id});
			this.cache?.del(this.key(name, id));
		}
		file.release();
	}

	async delete(name: string, id: number, filename: string) {
		let {attachments, index} = await this.getIndexOfAttachments(name, id, filename, true);
		attachments.splice(index, 1);
		await this.updateRecord(name, id, attachments);
		const path = this.getPath(name, id);
		fs.unlinkSync(Path.resolve(path, filename));
		this.removeStructure(path);
	}

	async setPosition(name: string, id: number, filename: string, position: number) {
		const attachments = await this.get(name, id);
		const idx = attachments.findIndex(a => a.name === filename);
		if (idx === -1) throw storageError.attachedFileNotFound(name, id, filename);
		if (idx === position) return;
		attachments.splice(position, 0, ...attachments.splice(idx, 1));
		await this.updateRecord(name, id, attachments);
	}

	async updateMetadata(name: string, id: number, filename: string, metadata: Record<string, any>) {
		const attachments = await this.get(name, id);
		console.log(attachments);
		const idx = attachments.findIndex(a => a.name === filename);
		if (idx === -1) throw storageError.attachedFileNotFound(name, id, filename);
		attachments[idx].metadata = {...attachments[idx].metadata, ...metadata};
		await this.updateRecord(name, id, attachments);
	}
}