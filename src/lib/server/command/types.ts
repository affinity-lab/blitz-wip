import {Request} from "express";
import {Buffer} from "buffer";
import FileField from "./file-field";

export type Args = Record<string, any>

export type CacheDef = {
    ttl: number,
    user?: boolean,
    cttl?: number
}

export type CommandSet = {};

// export type FileField = {
//     name: string,
//     mimetype: string,
//     size: number,
//     buffer: Buffer
// }
export type Files = Record<string, Array<FileField>>;

export type CommandFunc = (args: Args, req: Request, files: Files) => Promise<any>;