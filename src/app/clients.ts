import {IClient} from "../lib/client/client";
import {Jwt} from "../lib/jwt";
import {Request} from "express";

export class Client implements IClient {
	readonly jwt: Jwt<unknown>;

	constructor(readonly name: string, private key: string, private secret: string) {
		this.jwt = new Jwt(secret, "1h");
	}

	checkApiAccess(req: Request): boolean {
		return this.key === req.getHeader("api");
	}

	getAuthenticated(req: Request): undefined | string {
		return req.getHeader("auth");
	}
}

export const clients = {
    mobile: new Client("mobile", "000-111-222-333-444-555-666-777-888", "SECRET"),
    admin: new Client("admin", "000-111-222-333-444-555-666-777-888", "SECRET"),
    web: new Client("web", "000-111-222-333-444-555-666-777-888", "SECRET")
};

