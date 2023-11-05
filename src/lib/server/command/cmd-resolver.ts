import {CacheDef, CommandSet} from "./types";
import {CmdSetConfig} from "./cmd";
import {Request} from "express";
import Cache from "../../cache/cache";
import {Client} from "../../client/client";
import {Logger} from "../../exeption-handling/logger";
import Command from "./command";


type TResolvers =
    Record<string, // client
        Record<number, // version
            Record<string, // command
                Command
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

                /* Global clients */
                for (const client of cmdSetConfig.clients) {
                    if (!Array.isArray(client.version)) client.version = [client.version];
                    for (const version of client.version) this.addCmd(new Command(
                        target,
                        func,
                        authenticated,
                        defaultCache,
                        cmdConfig.validator,
                        client.client,
                        version,
                        command
                    ));
                }

                /* Command clients */
                for (const client of cmdConfig.clients) {
                    let c: undefined | CacheDef;
                    if (client.cache === false) c = undefined;
                    else if (client.cache === true) c = defaultCache;
                    else c = client.cache;
                    if (!Array.isArray(client.version)) client.version = [client.version];
                    for (const version of client.version) this.addCmd(new Command(
                        target,
                        func,
                        authenticated,
                        c,
                        cmdConfig.validator,
                        client.client,
                        version,
                        command
                    ));

                }
            }
        }
    }


    protected addCmd(cmd: Command) {
        if (!this.resolvers.hasOwnProperty(cmd.client.name)) this.resolvers[cmd.client.name] = {};
        if (!this.resolvers[cmd.client.name].hasOwnProperty(cmd.version)) this.resolvers[cmd.client.name][cmd.version] = {};
        if (this.resolvers[cmd.client.name][cmd.version].hasOwnProperty(cmd.command)) throw new Error(`CmdResolver ${cmd.client.name}/${cmd.version}/${cmd.command} has double declaration!`);
        this.resolvers[cmd.client.name][cmd.version][cmd.command] = cmd;
    }

    async handle(client: string, version: number, command: string, req: Request) {
        const c = this.resolvers[client];
        if (c === undefined) throw new Error("404"); // Client not found
        const v = c[version];
        if (v === undefined) throw new Error("404"); // Version not found
        const cmd = v[command];
        if (cmd === undefined) throw new Error("404"); // Command not found

        return cmd.handle(req, this.logger, this.cache);
    }
}
