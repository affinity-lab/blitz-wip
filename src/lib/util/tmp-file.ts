import {Buffer} from "buffer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export default class TmpFile {
	readonly uniqueDir: string;
	readonly file: string;
	constructor(readonly tmp: string, readonly filename: string, buffer: Buffer) {
		this.uniqueDir = crypto.randomUUID();
		this.file = path.resolve(tmp, this.uniqueDir, filename);
		fs.mkdirSync(path.resolve(this.tmp, this.uniqueDir));
		fs.writeFileSync(this.file, buffer);
	}
	release(): void | Promise<void> {
		fs.unlinkSync(this.file);
		fs.rmdirSync(path.resolve(this.tmp, this.uniqueDir));
	}

}