import {CacheDef, CommandFunc, CommandSet, Files} from "./types";
import {z} from "zod";
import {Client} from "../../client/client";
import {Request} from "express";
import {Logger} from "../../exeption-handling/logger";
import Cache from "../../cache/cache";
import {Jwt} from "../../jwt";
import crypto from "crypto";
import FileField from "./file-field";
import {BlitzError} from "../../exeption-handling/error";

export default
class Command {
    constructor(readonly target: CommandSet,
                readonly func: string,
                readonly authenticated: boolean,
                readonly cache: undefined | CacheDef,
                readonly validator: undefined | z.ZodObject<any>,
                readonly client: Client,
                readonly version: number,
                readonly command: string) {
    }

    async handle(req: Request, logger: Logger, cache: Cache | undefined) {
        this.checkApiAccess(req);
        const authenticated = this.getAuthenticated(req);
        req.context.set("client", this.client);
        req.context.set("authenticated", authenticated);
        let {args, type, files} = this.parseRequest(req);
        logger.request(`(${type}) ${this.client.name}.${this.version}/${this.command} - Authenticated: ${Jwt.getStringContent(authenticated)}`);
        args = this.validateArgs(args);

        let cacheKey: string = "";
        if (cache !== undefined && this.cache) {
            cacheKey = crypto.createHash("md5").update(this.client.name + this.version + this.command + JSON.stringify(args) + (this.cache.user ? JSON.stringify(authenticated) : "")).digest("hex");
            const cached = await cache.get(cacheKey);
            if (cached !== undefined) return cached;

        }
        const res = await (this.target as { [key: string]: CommandFunc; })[this.func](args, req, files);
        if (cache !== undefined && this.cache) await cache.set({key: cacheKey, value: res}, this.cache.ttl);
        return res;
    }

    protected checkApiAccess(req: Request) {
        if (!this.client.checkApiAccess(req)) throw new Error("403"); // Client not authorized
    }

    protected getAuthenticated(req: Request) {
        const authenticated = this.client.getAuthenticated(req);
        if (this.authenticated && authenticated === undefined) throw new Error("401"); // User not authenticated
        return authenticated;
    }

    protected parseRequest(req: Request): ({ type: "json" | "form-data", args: Record<string, any>, files: Files }) {
        let type: "json" | "form-data";
        let args;
        let files: Files = {};
        if (req.is("application/json")) {
            type = "json";
            args = req.body;
        } else if (req.is("multipart/form-data")) {
            type = "form-data";
            args = req.body;
            if (req.files !== undefined) {
                for (const file of req.files as Array<Express.Multer.File>) {
                    if (files[file.fieldname] === undefined) files[file.fieldname] = [];
                    files[file.fieldname].push(new FileField(file.originalname, file.mimetype, file.size, file.buffer));
                }
            }
        } else {
            throw new BlitzError("Request not accepted", "2");
        }
        return {type, args, files};
    }

    protected validateArgs(args: Record<string, any>): Record<string, any> {
        if (this.validator) {
            let parsed = this.validator.safeParse(args);
            if (!parsed.success) throw new BlitzError(`Error when calling ${this.client.name}.${this.version}/${this.command}`, "1", parsed.error.issues);
            args = parsed.data;
        }
        return args;
    }
}