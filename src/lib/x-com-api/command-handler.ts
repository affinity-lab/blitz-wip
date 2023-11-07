import {CacheOptions, CommandFunc, IClient} from "./types";
import {Request} from "express";
import crypto from "crypto";
import {blitzError} from "../errors";
import CommandResolver from "./command-resolver";

export default class CommandHandler {
	constructor(
		readonly handler: CommandFunc,
		readonly authenticated: boolean,
		readonly cacheOptions: undefined | CacheOptions,
		readonly sanitize: undefined | ((args: Record<string, any>) => Record<string, any>),
		readonly validate: undefined | ((args: Record<string, any>) => Record<string, any>),
		readonly client: IClient,
		readonly version: number,
		readonly command: string,
		readonly commandResolver: CommandResolver
	) {
	}


	async handle(req: Request) {
		this.checkApiAccess(req);
		const authenticated = this.getAuthenticated(req);
		let {args, type, files} = this.commandResolver.requestParser.parse(req);
		req.context.set("client", this.client);
		req.context.set("version", this.version);
		req.context.set("command", this.command);
		req.context.set("authenticated", authenticated);
		req.context.set("request-type", type);
		if (this.commandResolver.onRequestAccepted !== undefined) this.commandResolver.onRequestAccepted(req);

		if (this.sanitize !== undefined) args = this.sanitize(args);
		if (this.validate !== undefined) args = this.validate(args);

		let handler = async () => await this.handler(args, req, files);

		return (this.commandResolver.cacheReader === undefined || this.cacheOptions === undefined)
			   ? handler()
			   : this.commandResolver.cacheReader(handler, this.getCacheKey(args, authenticated), this.cacheOptions.ttl);
	}

	protected getCacheKey(args: Record<string, any>, authenticated?: string) {
		return crypto.createHash("md5").update(
			this.client.name + "." + this.version + "/" + this.command +
			JSON.stringify(args) +
			(this.cacheOptions!.user ? JSON.stringify(authenticated) : "")
		).digest("hex");
	}

	protected checkApiAccess(req: Request) {
		if (!this.client.checkApiAccess(req)) throw blitzError.command.clientNotAuthorized(); // Client not authorized
	}

	protected getAuthenticated(req: Request) {
		const authenticated = this.client.getAuthenticated(req);
		if (this.authenticated && authenticated === undefined) throw blitzError.command.userNotAuthenticated(); // User not authenticated
		return authenticated;
	}

}