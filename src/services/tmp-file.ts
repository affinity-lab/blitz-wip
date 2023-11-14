import TmpFile from "../lib/tmp-file";
import {Buffer} from "buffer";
import cfg from "./config";

export const tmpFile = (name: string, buffer: Buffer) => {
	return new TmpFile(cfg.storage.tmp, name, buffer);
};