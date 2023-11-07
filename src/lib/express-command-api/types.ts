import {Request} from "express";
import FileField from "./file-field";

export type Args = Record<string, any>

export type CacheOptions = {
	ttl: number,
	user?: boolean,
	cttl?: number
}

export type CommandSet = {};

export type Files = Record<string, Array<FileField>>;

export type CommandFunc = (args: Args, req: Request, files: Files) => Promise<any>;

export interface IRequestParser {
	parse(req: Request): { type: string, args: Record<string, any>, files: Files };
}