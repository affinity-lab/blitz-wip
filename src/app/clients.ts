import {Request} from "express";
import {IClient} from "@affinity-lab/x-com";
import {Jwt} from "@affinity-lab/affinity-util";

export class Client implements IClient {
	readonly jwt: Jwt<unknown>;

	constructor(readonly name: string, private key: string, private secret: string) {
		this.jwt = new Jwt(secret, "1h");
	}

	checkApiAccess(req: Request): boolean {
		return this.key === req.getHeader("x-api-key");
	}

	getAuthenticated(req: Request): undefined | string {
		let auth = req.getHeader("authorization")?.substring("bearer ".length).trim();
		return auth || undefined;
	}
}

export const clients = {
    mobile: new Client("mobile", "test", "SECRET"),
    admin: new Client("admin", "test", "SECRET"),
    web: new Client("web", "test", "SECRET")
};

