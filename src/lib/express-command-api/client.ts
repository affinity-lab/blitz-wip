import {Request} from "express";

export interface IClient {
	readonly name: string;
	checkApiAccess(req: Request): boolean;
	getAuthenticated(req: Request): undefined | string;
}

