import {CacheOptions, IClient} from "./types";

type Constructor = (new () => Object) | Function;

export class XComConfig {
	alias: string;
	clients: Array<{ client: IClient, version: number | Array<number> }> = [];
	authenticated: boolean = false;

	cmdConfigs: Record<string, CommandConfig> = {};

	constructor(public target: Constructor) {
		this.alias = target.name;
	}

	private static get(target: Constructor): XComConfig {
		return Reflect.has(target, "cmd-set")
			   ? Reflect.get(target, "cmd-set")
			   : new XComConfig(target);
	};

	static set(target: Constructor, callback: (cmdSet: XComConfig) => XComConfig) {
		const value = callback(this.get(target));
		Reflect.set(target, "cmd-set", value);
	}

	getCmd(name: string | symbol) {
		return this.cmdConfigs.hasOwnProperty(name)
			   ? this.cmdConfigs[name.toString()]
			   : this.cmdConfigs[name.toString()] = new CommandConfig(name.toString());
	}

	static getConfigsFromCommandSets(commands: {}[]) {
		return commands.map(command => Reflect.get(command, "cmd-set"));
	}
}

export class CommandConfig {
	alias: string;
	cache?: CacheOptions;
	clients: Array<{ client: IClient, version: number | Array<number>, cache: boolean | CacheOptions }> = [];
	authenticated?: boolean;
	sanitize?: (args: Record<string, any>) => Record<string, any>;
	validate?: (args: Record<string, any>) => Record<string, any>;

	constructor(public func: string) {this.alias = func;}
}