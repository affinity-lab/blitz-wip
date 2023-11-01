import {CacheDef, CommandFunc, CommandSet} from "./types.js";
import {CmdSetConfig} from "./cmd.js";
import {Request} from "express";
import Cache from "../cache/cache.js";
import {Client} from "./client.js";
import * as crypto from "crypto";

type TResolverCmd = { // command
    target: CommandSet,
    func: string,
    authenticated: boolean,
    cache: undefined | CacheDef
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

    public resolvers: TResolvers = {};
    public cache: undefined | Cache;
    public authResolver?: (req: Request) => undefined | string;

    protected addCmd(client: string, version: number | Array<number>, command: string, cmd: TResolverCmd) {
        if (!this.resolvers.hasOwnProperty(client)) this.resolvers[client] = {};
        if (!Array.isArray(version)) version = [version];
        for (const v of version) {
            if (!this.resolvers[client].hasOwnProperty(v)) this.resolvers[client][v] = {};
            if (this.resolvers[client][v].hasOwnProperty(command)) throw new Error(`CmdResolver ${client}/${v}/${command} has double declaration!`);
            this.resolvers[client][v][command] = cmd;
        }
    }

    constructor(private clients: Record<string, Client>, ...commands: Array<CommandSet>) {
        const cmdSets: Array<CmdSetConfig> = CmdSetConfig.getFroomCommandSets(commands);
        for (const cmdSet of cmdSets) {
            const defaultAuthenticated = (cmdSet.authenticated === undefined ? false : cmdSet.authenticated);
            for (const cmdKey in cmdSet.cmds) {
                const cmd = cmdSet.cmds[cmdKey];
                const defaultCache = (cmd.cache === undefined ? undefined : cmd.cache);
                const target = new (cmdSet.target as new () => CommandSet)();
                let func = cmd.func;
                let authenticated: boolean = cmd.authenticated === undefined ? defaultAuthenticated : cmd.authenticated;
                const command = cmdSet.alias + "." + cmd.alias;

                for (const client of cmdSet.clients) {
                    this.addCmd(client.client.name, client.version, command, {
                        target,
                        func,
                        authenticated,
                        cache: defaultCache
                    });
                }
                for (const client of cmd.clients) {
                    let cache: undefined | CacheDef;
                    if (client.cache === false) cache = undefined;
                    else if (client.cache === true) cache = defaultCache;
                    else cache = client.cache;
                    this.addCmd(client.client.name, client.version, command, {
                        target,
                        func,
                        authenticated,
                        cache
                    });
                }
            }
        }
    }

    async handle(client: string, version: number, command: string, req: Request) {
        const c = this.resolvers[client];
        if (c === undefined) throw new Error("404");
        const v = c[version];
        if (v === undefined) throw new Error("404");
        const cmd = v[command];
        if (cmd === undefined) throw new Error("404");

        const authenticated = this.authResolver ? this.authResolver(req) : undefined;

        req.context.set("client", this.clients[client]);
        req.context.set("authenticated", authenticated);

        if (authenticated === undefined && cmd.authenticated) throw Error("401");

        const args = req.body;
        let key: string = "";
        if (cmd.cache !== undefined && this.cache) {
            key = crypto.createHash("md5").update(JSON.stringify(args) + (cmd.cache.user ? JSON.stringify(authenticated) : "")).digest("hex");
            const cached = await this.cache.get(key);
            if (cached !== undefined){
                console.log("cached");
                return cached;
            }
        }

        const res = await (cmd.target as { [key: string]: CommandFunc; })[cmd.func]({}, req);
        if (cmd.cache !== undefined && this.cache) {
            this.cache.set({key, value: res}, cmd.cache.ttl);
        }
        console.log("generated");
        return res;
    }
}