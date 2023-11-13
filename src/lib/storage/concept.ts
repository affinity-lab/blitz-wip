import {EventEmitter} from "events";
import {MySqlTable, PreparedQuery} from "drizzle-orm/mysql-core";
import {DrizzleRepositoryEvents} from "../drizzle-repository/events";
import BlitzCache from "../blitz-cache/blitz-cache";
import MySqlRepository from "../drizzle-repository/my-sql-repository";
import {storageError} from "./errors";
import * as fs from "fs";
import Path from "path";
import {and, eq, sql} from "drizzle-orm";
import {MySql2Database} from "drizzle-orm/mysql2";

type Attachment = {
	name: string
	size: number
	metadata: Record<string, any>
}

type Attachments = Array<Attachment>;

type AttachmentRecord = {
	id: number
	name: string
	itemId: number
	data: Attachments
}

type TmpFile = {
	file: string
	release: () => void | Promise<void>
}

type Rules = {
	size: number,
	limit: number,
	ext?: string | Array<string>,
}

class Storage {

	private queries: Record<string, PreparedQuery<any>> = {};

	constructor(
		readonly path: string,
		readonly db: MySql2Database,
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
			newName = `${baseName} (${count})${extName}`;
			count++;
		}
		return newName;
	}

	async get(name: string, id: number): Promise<Attachments>;
	async get(name: string, id: Array<number>): Promise<Record<number, Attachments>>;
	async get(name: string, id: number | Array<number>): Promise<Attachments | Record<number, Attachments>> ;
	async get(name: string, id: number | Array<number>): Promise<Attachments | Record<number, Attachments>> {
		if (Array.isArray(id)) {
			if (id.length === 0) return [];
			let records: Array<AttachmentRecord>;
			const res: Record<number, Attachments> = {};
			if (this.cache !== undefined) {
				// get available items from cache
				let keys = id.map(id => this.key(name, id));
				records = await this.cache.get(keys);
				for (const i in records) res[records[i].itemId] = records[i].data;
				// get the rest and set to cache
				const has: Array<number> = records.map(record => record.itemId);
				const need = id.filter(i => !has.includes(i));
				records = await this.queries.all.execute({name, need});
				for (const i in records) res[records[i].itemId] = records[i].data;
				const toCache = records.map(record => {return {key: this.key(record.name, record.itemId), value: record};});
				await this.cache.set(toCache);
			} else {
				records = await this.queries.all.execute({name, id});
				for (const i in records) res[records[i].itemId] = records[i].data;
			}
			return res;
		} else {
			//read from cache
			let record: AttachmentRecord | undefined = await this.cache?.get(this.key(name, id));
			if (record !== undefined) return record.data;
			//read from db
			const records: Array<AttachmentRecord> = await this.queries.get.execute({name, id});
			if (records && records.length > 0) {
				record = records[0];
				this.cache?.set({key: this.key(name, id), value: record});
				return record.data;
			}
			return [];
		}
	}

	protected async getIndexOfAttachments(name: string, id: number, filename: string, fail: boolean = false) {
		const attachments = await this.get(name, id);
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
		// todo: copy the file
		// todo: create or update the record
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
		const idx = attachments.findIndex(a => a.name === filename);
		if (idx === -1) throw storageError.attachedFileNotFound(name, id, filename);
		attachments[idx].metadata = {...attachments[idx].metadata, ...metadata};
		await this.updateRecord(name, id, attachments);
	}
}

class Collection<METADATA extends Record<string, any>> {
	constructor(
		readonly name: string,
		readonly emitter: EventEmitter,
		readonly repository: MySqlRepository,
		readonly storage: Storage,
		readonly rules: Rules
	) {
		// if it was a string cast it to array
		if (typeof this.rules.ext === "string") this.rules.ext = [this.rules.ext];
		// if it was an empty string cast it to undefined
		if (Array.isArray(this.rules.ext) && this.rules.ext.length === 0) this.rules.ext = undefined;
		emitter.on(
			DrizzleRepositoryEvents.Deleted,
			(repo: MySqlRepository, id: number) => repo === this.repository && this.storage.destroy(this.name, id)
		);
	}

	protected async updateMetadata(id: number, filename: string, metadata: Partial<METADATA>) {
		await this.storage.updateMetadata(this.name, id, filename, metadata);
	}

	protected async prepareFile(file: TmpFile): Promise<{ file: TmpFile, metadata: Record<string, any> }> {return {file, metadata: {}};}

	async add(id: number, file: TmpFile) {
		let metadata: Record<string, any>;
		const ext = Path.extname(file.file);
		const filename = Path.basename(file.file);

		// check if entity exists
		if (await this.repository.get(id) === undefined) {
			throw storageError.ownerNotExists(this.repository.name, id);
		}

		// check limit
		const attachments = await this.storage.get(this.name, id);
		if (attachments.length >= this.rules.limit) {
			throw storageError.tooManyFiles(this.repository.name, id, filename, this.rules.limit);
		}

		// check extension
		if (this.rules.ext !== undefined && !this.rules.ext.includes(ext)) {
			throw storageError.extensionNotAllowed(this.repository.name, id, filename, this.rules.ext);
		}

		// prepare (modify, replace, whatever) the file
		({file, metadata} = await this.prepareFile(file));

		// check size
		let size = fs.statSync(file.file).size;
		if (size > this.rules.size) {
			throw storageError.fileTooLarge(this.repository.name, id, filename, this.rules.size);
		}

		await this.storage.add(this.name, id, file, metadata);
	}

	async delete(id: number, filename: string) {
		await this.storage.delete(this.name, id, filename);
	}

	async get(id: number): Promise<Attachments> ;
	async get(ids: Array<number>): Promise<Record<number, Attachments>>;
	async get(id: number | Array<number>): Promise<Record<number, Attachments> | Attachments> {
		return await this.storage.get(this.name, id);
	}

	async setPosition(id: number, filename: string, position: number) {
		await this.storage.setPosition(this.name, id, filename, position);
	}
}

class Document extends Collection<{ title: string }> {
	async setTitle(id: number, filename: string, title: string) {
		await this.updateMetadata(id, filename, {title});
	}
}