import {Request} from "express";
import FileField from "./file-field";

export type Args = Record<string, any>

export type CacheOptions = {
	ttl: number,
	user?: boolean,
	cttl?: number,
	key?: string | ((args: Record<string, any>) => string)
}

export type CommandSet = {};

export type Files = Record<string, Array<FileField>>;

export type CommandFunc = (args: Args, req: Request, files: Files) => Promise<any>;

export interface IRequestParser {
	parse(req: Request): { type: string, args: Record<string, any>, files: Files };
}

export interface IClient {
	readonly name: string;
	checkApiAccess(req: Request): boolean;
	getAuthenticated(req: Request): undefined | string;
}