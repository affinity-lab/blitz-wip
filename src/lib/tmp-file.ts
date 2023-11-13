import {Buffer} from "buffer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

class TmpFile{
	readonly uniqueDir:string;
	constructor(readonly tmp: string, readonly filename: string, buffer:Buffer) {
		this.uniqueDir = crypto.randomUUID();
		fs.mkdirSync(path.resolve(this.tmp, this.uniqueDir))
		fs.writeFileSync(path.resolve(tmp, this.uniqueDir, filename), buffer);
	}
	release(){
		fs.unlinkSync(path.resolve(this.tmp, this.uniqueDir, this.filename))
		fs.rmdirSync(path.resolve(this.tmp, this.uniqueDir))
	}
}