import {Jwt} from "../jwt.js";
import {Request} from "express";

export interface IClient {
    readonly jwt: Jwt<any>;

    checkApiAccess(req: Request): boolean;

    getAuthenticated(req: Request): undefined | string | number;
}

export class Client implements IClient {
    readonly jwt: Jwt<unknown>;

    constructor(readonly name: string, private key: string, private secret: string) {
        this.jwt = new Jwt(secret, "1h");
    }

    checkApiAccess(req: Request): boolean {
        return this.key === req.getHeader("api");
    }

    getAuthenticated(req: Request): undefined | string | number {
        return req.getHeader("auth");
    }
}
