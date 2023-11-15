import * as fs from "fs";
import * as mime from "mime-types";
import * as path from "path";
import sharp from "sharp";
import {MaterializeIt} from "./materialize-it";


export class FileDescriptor {
	public readonly file: string;

	constructor(file: string) {this.file = fs.realpathSync(file);};

	@MaterializeIt() get stat(): Promise<fs.Stats | null> { return fs.promises.stat(this.file).catch((): null => null);};
	get size(): Promise<number> { return this.stat.then((stat: fs.Stats | null): number => stat !== null ? stat.size : 0);};
	get exists(): Promise<boolean> {return this.stat.then((stat: fs.Stats | null): boolean => stat !== null);};
	get name(): string {return this.parsedPath.base;};
	@MaterializeIt() get parsedPath(): path.ParsedPath {return path.parse(this.file);};

	@MaterializeIt() get mimeType(): string | false {return mime.lookup(this.file);};

	@MaterializeIt() get isImage(): boolean { return this.mimeType.toString().substring(0, 6) === "image/";};
	@MaterializeIt() get image(): Promise<{
		meta: sharp.Metadata,
		stats: sharp.Stats
	} | null> {
		sharp.cache({files: 0});
		if (!this.isImage) {
			return Promise.resolve(null);
		}
		let img: sharp.Sharp = sharp(this.file);
		return Promise.all([img.metadata(), img.stats()])
					  .then((res: [sharp.Metadata, sharp.Stats]) => ({meta: res[0], stats: res[1]}));
	};
}
