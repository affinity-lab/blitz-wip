import {CacheOptions, CommandFunc, CommandSet, Files} from "./types";
import {Request, Response} from "express";
import CommandHandler from "./command-handler";
import {blitzError} from "../errors";
import {fatalError} from "../error/fatal-error";
import RequestParser from "./request-parser";
import {XComConfig} from "./x-com-api";
import {ResponseType} from "./responseType";
import {EventEmitter} from "events";


type TResolvers =
	Record<string, // client
		Record<number, // version
			Record<string, // command
				CommandHandler
			>
		>
	>

type CacheReaderFunc = (handler: () => any, key: string, ttl: number) => Promise<any>;

type CommandResolverOptions = {
	requestParser: RequestParser,
	cacheReader: CacheReaderFunc,
	eventEmitter: EventEmitter
}

export default class CommandResolver {

	readonly resolvers: TResolvers = {};
	readonly requestParser: RequestParser;
	readonly cacheReader: CacheReaderFunc | undefined;
	readonly eventEmitter: EventEmitter | undefined;

	constructor(
		private commandSets: Array<CommandSet>,
		options: Partial<CommandResolverOptions> = {}
	) {
		this.requestParser = options.requestParser === undefined ? new RequestParser() : options.requestParser;
		this.cacheReader = options.cacheReader;
		this.eventEmitter = options.eventEmitter;
		this.parse();
	}

	protected parse() {
		const cmdSetsConfig: Array<XComConfig> = XComConfig.getConfigsFromCommandSets(this.commandSets);
		for (const cmdSetConfig of cmdSetsConfig) {
			const defaultAuthenticated = (cmdSetConfig.authenticated === undefined ? false : cmdSetConfig.authenticated);
			for (const cmdKey in cmdSetConfig.cmdConfigs) {

				const cmdConfig = cmdSetConfig.cmdConfigs[cmdKey];

				const defaultCacheOptions = (cmdConfig.cache === undefined ? undefined : cmdConfig.cache);
				const target = new (cmdSetConfig.target as new () => CommandSet)();
				let func = cmdConfig.func;
				let authenticated: boolean = cmdConfig.authenticated === undefined ? defaultAuthenticated : cmdConfig.authenticated;
				const command = cmdSetConfig.alias + "." + cmdConfig.alias;
				const handler = async (args: Record<string, any>, req: Request, files: Files) => await (target as {
					[key: string]: CommandFunc
				})[func](args, req, files);


				/* Global clients */
				for (const client of cmdSetConfig.clients) {
					if (!Array.isArray(client.version)) client.version = [client.version];
					for (const version of client.version) {
						this.addCmd(new CommandHandler(
							handler,
							authenticated,
							defaultCacheOptions,
							cmdConfig.sanitize,
							cmdConfig.validate,
							client.client,
							version,
							command,
							this
						));
					}
				}

				/* Command clients */
				for (const client of cmdConfig.clients) {
					let cacheOptions: undefined | CacheOptions;
					if (client.cache === false) {
						cacheOptions = undefined;
					} else if (client.cache === true) {
						cacheOptions = defaultCacheOptions;
					} else {
						cacheOptions = client.cache;
					}

					if (!Array.isArray(client.version)) client.version = [client.version];
					for (const version of client.version) {
						this.addCmd(new CommandHandler(
							handler,
							authenticated,
							cacheOptions,
							cmdConfig.sanitize,
							cmdConfig.validate,
							client.client,
							version,
							command,
							this
						));
					}

				}
			}
		}
	}


	protected addCmd(cmd: CommandHandler) {
		if (!this.resolvers.hasOwnProperty(cmd.client.name)) this.resolvers[cmd.client.name] = {};
		if (!this.resolvers[cmd.client.name].hasOwnProperty(cmd.version)) this.resolvers[cmd.client.name][cmd.version] = {};
		if (this.resolvers[cmd.client.name][cmd.version].hasOwnProperty(cmd.command)) throw fatalError(`CommandResolver ${cmd.client.name}/${cmd.version}/${cmd.command} has double declaration!`);
		this.resolvers[cmd.client.name][cmd.version][cmd.command] = cmd;
	}

	async handle(client: string, version: number, command: string, req: Request, res: Response) {
		const c = this.resolvers[client];
		if (c === undefined) throw blitzError.command.notFound(`client not found: ${client}`); // Client not found
		const v = c[version];
		if (v === undefined) throw blitzError.command.notFound(`version not found ${client}.${version}`); // Version not found
		const cmd = v[command];
		if (cmd === undefined) throw blitzError.command.notFound(`command not found ${client}.${version}/${command}`); // Command not found

		const result = await cmd.handle(req, res);
		if (result instanceof ResponseType) {
			await result.send(res);
		} else {
			res.json(result);
		}
	}
}
