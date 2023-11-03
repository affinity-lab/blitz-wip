import {CacheDef, CommandFunc, CommandSet} from "./types.js";
import {CmdSetConfig} from "./cmd.js";
import {Request} from "express";
import Cache from "../cache/cache.js";
import {Client} from "../client/client.js";
import * as crypto from "crypto";
import {Logger} from "../exeption-handling/logger.js";
import {Jwt} from "../jwt.js";
import {z} from "zod";
import {BlitzError} from "../exeption-handling/error";

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

        this.logger.request(`${client.name}.${version}/${command} - Authenticated: ${Jwt.getStringContent(authenticated)}`);

        let args = req.body;

        if(cmd.validator) {
            let parsed = cmd.validator.safeParse(args);
            if (!parsed.success) throw new BlitzError(`Error when calling ${client.name}.${version}/${command}`, "1", parsed.error.issues);
            args = parsed.data
        }

        let cacheKey: string = "";
        if (cmd.cache !== undefined && this.cache) {
            cacheKey = crypto.createHash("md5").update(clientName + version + command + JSON.stringify(args) + (cmd.cache.user ? JSON.stringify(authenticated) : "")).digest("hex");
            const cached = await this.cache.get(cacheKey);
            if (cached !== undefined){
                return cached;
            }
        }
        const res = await (cmd.target as { [key: string]: CommandFunc; })[cmd.func](args, req);

        if (cmd.cache !== undefined && this.cache) await this.cache.set({key: cacheKey, value: res}, cmd.cache.ttl);

        return res;
    }
}