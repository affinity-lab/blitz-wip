import {CacheDef, CommandFunc, CommandSet, Files} from "./types";
import {CmdSetConfig} from "./cmd";
import {Request} from "express";
import Cache from "../../cache/cache";
import {Client} from "../../client/client";
import * as crypto from "crypto";
import {Logger} from "../../exeption-handling/logger";
import {Jwt} from "../../jwt";
import {z} from "zod";
import {BlitzError} from "../../exeption-handling/error";
import * as console from "console";
import FileField from "./file-field";

type TResolverCmd = { // command
    target: CommandSet,
    func: string,
    authenticated: boolean,
    cache: undefined | CacheDef,
    validator?: z.ZodObject<any>
}

type TResolvers =
    Record<string, // client
        Record<number, // version
            Record<string, // command
                TResolverCmd
            >
        >
    >

export default class CmdResolver {

    readonly resolvers: TResolvers = {};

    constructor(
        private clients: Record<string, Client>,
        private cache: undefined | Cache,
        private logger: Logger,
        ...commandSets: Array<CommandSet>
    ) {
        const cmdSetsConfig: Array<CmdSetConfig> = CmdSetConfig.getConfigsFromCommandSets(commandSets);
        for (const cmdSetConfig of cmdSetsConfig) {
            const defaultAuthenticated = (cmdSetConfig.authenticated === undefined ? false : cmdSetConfig.authenticated);
            for (const cmdKey in cmdSetConfig.cmds) {

                const cmdConfig = cmdSetConfig.cmds[cmdKey];

                const defaultCache = (cmdConfig.cache === undefined ? undefined : cmdConfig.cache);
                const target = new (cmdSetConfig.target as new () => CommandSet)();
                let func = cmdConfig.func;
                let authenticated: boolean = cmdConfig.authenticated === undefined ? defaultAuthenticated : cmdConfig.authenticated;
                const command = cmdSetConfig.alias + "." + cmdConfig.alias;

                for (const client of cmdSetConfig.clients) {
                    this.addCmd(client.client.name, client.version, command, {
                        target,
                        func,
                        authenticated,
                        cache: defaultCache,
                        validator: cmdConfig.validator
                    });
                }
                for (const client of cmdConfig.clients) {
                    let c: undefined | CacheDef;
                    if (client.cache === false) c = undefined;
                    else if (client.cache === true) c = defaultCache;
                    else c = client.cache;
                    this.addCmd(client.client.name, client.version, command, {
                        target,
                        func,
                        authenticated,
                        cache: c,
                        validator: cmdConfig.validator
                    });
                }
            }
        }
    }


    protected addCmd(client: string, version: number | Array<number>, command: string, cmd: TResolverCmd) {
        if (!this.resolvers.hasOwnProperty(client)) this.resolvers[client] = {};
        if (!Array.isArray(version)) version = [version];
        for (const v of version) {
            if (!this.resolvers[client].hasOwnProperty(v)) this.resolvers[client][v] = {};
            if (this.resolvers[client][v].hasOwnProperty(command)) throw new Error(`CmdResolver ${client}/${v}/${command} has double declaration!`);
            this.resolvers[client][v][command] = cmd;
        }
    }


    async handle(clientName: string, version: number, command: string, req: Request) {
        const c = this.resolvers[clientName];
        if (c === undefined) throw new Error("404"); // Client not found
        const v = c[version];
        if (v === undefined) throw new Error("404"); // Version not found
        const cmd = v[command];
        if (cmd === undefined) throw new Error("404"); // Command not found


        const client = this.clients[clientName];
        if (client === undefined) throw new Error("401"); // Client not found
        if (!client.checkApiAccess(req)) throw new Error("403"); // Client not authorized


        const authenticated = client.getAuthenticated(req);
        if (cmd.authenticated && authenticated === undefined) throw new Error("401"); // User not authenticated

        req.context.set("client", this.clients[clientName]);
        req.context.set("authenticated", authenticated);


        let type: string = "";
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

        this.logger.request(`(${type}) ${client.name}.${version}/${command} - Authenticated: ${Jwt.getStringContent(authenticated)}`);


        if (cmd.validator) {
            let parsed = cmd.validator.safeParse(args);
            if (!parsed.success) throw new BlitzError(`Error when calling ${client.name}.${version}/${command}`, "1", parsed.error.issues);
            args = parsed.data;
        }

        let cacheKey: string = "";
        if (cmd.cache !== undefined && this.cache) {
            cacheKey = crypto.createHash("md5").update(clientName + version + command + JSON.stringify(args) + (cmd.cache.user ? JSON.stringify(authenticated) : "")).digest("hex");
            const cached = await this.cache.get(cacheKey);
            if (cached !== undefined) {
                return cached;
            }
        }
        const res = await (cmd.target as { [key: string]: CommandFunc; })[cmd.func](args, req, files);

        if (cmd.cache !== undefined && this.cache) await this.cache.set({key: cacheKey, value: res}, cmd.cache.ttl);

        return res;
    }
}