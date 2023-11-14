import {EventEmitter} from "events";
import MySqlRepository from "../drizzle-repository/my-sql-repository";
import {DrizzleRepositoryEvents} from "../drizzle-repository/events";
import Path from "path";
import {storageError} from "./errors";
import fs from "fs";
import {Attachments, Rules, TmpFile} from "./types";
import {CollectionStorage} from "./collection-storage";

export class Collection<METADATA extends Record<string, any>> {
	constructor(
		readonly name: string,
		readonly emitter: EventEmitter,
		readonly repository: MySqlRepository,
		readonly storage: CollectionStorage,
		readonly rules: Rules
	) {
		// if it was a string cast it to array
		if (typeof this.rules.ext === "string") this.rules.ext = [this.rules.ext];
		// if it was an empty string cast it to undefined
		if (Array.isArray(this.rules.ext) && this.rules.ext.length === 0) this.rules.ext = undefined;
		console.log("MOUNTED");
		this.emitter.on(
			DrizzleRepositoryEvents.Deleted,
			async (repo: MySqlRepository, id: number) => {
				console.log(id);
				console.log(repo);
				if (repo === this.repository) {
					console.log("DESTROY");
					await this.storage.destroy(this.name, id);
				}
			}
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
		console.log(attachments.length, this.rules.limit);
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
		console.log(file.file);
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