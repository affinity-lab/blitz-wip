import {Buffer} from "buffer";
import cfg from "./config";
import {TmpFile} from "@affinity-lab/affinity-util";

export const tmpFile = (name: string, buffer: Buffer) => {
	return new TmpFile(cfg.storage.tmp, name, buffer);
};