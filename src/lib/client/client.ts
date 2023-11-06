import {Jwt} from "../jwt";
import {Request} from "express";

export interface IClient {
    readonly jwt: Jwt<any>;
	readonly name:string;
    checkApiAccess(req: Request): boolean;
    getAuthenticated(req: Request): undefined | string ;
}

