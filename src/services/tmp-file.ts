import {Buffer} from "buffer";
import cfg from "./config";
import {TmpFile} from "@affinity-lab/affinity-util";
import {FileField} from "@affinity-lab/x-com/src/file-field";

export function tmpFile(file: FileField): TmpFile;
export function tmpFile(name: string, buffer: Buffer): TmpFile;
export function tmpFile(name: string | FileField, buffer?: Buffer) {
	if (typeof name !== "string") {
		const file = name;
		name = file.name;
		buffer = file.buffer;
	}
	return new TmpFile(cfg.storage.tmp, name, buffer!);
}