import {Buffer} from "buffer";
import * as fs from "fs";
import path from "path";

export default class FileField {
	constructor(readonly name: string,
				readonly mimetype: string,
				readonly size: number,
				readonly buffer: Buffer) {
	}

	save(to: string) {
		fs.writeFileSync(path.resolve("var", to, this.name), this.buffer);
	}
}