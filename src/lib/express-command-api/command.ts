import {CacheOptions} from "./types";
import {IClient} from "./client";

type Constructor = (new () => Object) | Function;


export class CommandConfig {
	alias: string;
	cache?: CacheOptions;
	clients: Array<{ client: IClient, version: number | Array<number>, cache: boolean | CacheOptions }> = [];
	authenticated?: boolean;
	sanitize?: (args: Record<string, any>) => Record<string, any>;
	validate?: (args: Record<string, any>) => Record<string, any>;

	constructor(public func: string) {this.alias = func;}
}

export class CommandSetConfig {
	alias: string;
	clients: Array<{ client: IClient, version: number | Array<number> }> = [];
	authenticated: boolean = false;

	cmdConfigs: Record<string, CommandConfig> = {};

	constructor(public target: Constructor) {
		this.alias = target.name;
	}

	private static get(target: Constructor): CommandSetConfig {
		if (Reflect.has(target, "cmd-set")) {
			return Reflect.get(target, "cmd-set");
		}
		return new CommandSetConfig(target);
	};

	static set(target: Constructor, callback: (cmdSet: CommandSetConfig) => CommandSetConfig) {
		const value = callback(this.get(target));
		Reflect.set(target, "cmd-set", value);
	}

	getCmd(name: string | symbol) {
		return this.cmdConfigs.hasOwnProperty(name) ? this.cmdConfigs[name.toString()] : this.cmdConfigs[name.toString()] = new CommandConfig(name.toString());
	}

	static getConfigsFromCommandSets(commands: {}[]) {
		return commands.map(command => Reflect.get(command, "cmd-set"));
	}
}


export const Command = (alias?: string): MethodDecorator => {
	return function (target, propertyKey) {
		CommandSetConfig.set(target.constructor, cmdSet => {
			const cmd = cmdSet.getCmd(propertyKey);
			if (alias) cmd.alias = alias;
			return cmdSet;
		});
	};
};


export const CommandCache = (cache: CacheOptions): MethodDecorator => {
	return function (target, propertyKey) {
		CommandSetConfig.set(target.constructor, cmdSet => {
			const cmd = cmdSet.getCmd(propertyKey);
			cmd.cache = cache;
			return cmdSet;
		});
	};
};

export const CommandAuthenticated = (status: boolean = true): MethodDecorator => {
	return function (target, propertyKey) {
		CommandSetConfig.set(target.constructor, cmdSet => {
			const cmd = cmdSet.getCmd(propertyKey);
			cmd.authenticated = status;
			return cmdSet;
		});
	};
};
export const CommandClient = (client: IClient, version: number | Array<number> = 1, cache: boolean | CacheOptions = true): MethodDecorator => {
	return function (target, propertyKey) {
		CommandSetConfig.set(target.constructor, cmdSet => {
			const cmd = cmdSet.getCmd(propertyKey);
			cmd.clients.push({client, version, cache});
			return cmdSet;
		});
	};
};


export const CommandSet = (alias?: string): ClassDecorator => {
	return function (target) {
		CommandSetConfig.set(target, cmdSet => {
			if (alias) cmdSet.alias = alias;
			return cmdSet;
		});
	};
};

export const CommandSetClient = (client: IClient, version: number | Array<number> = 1): ClassDecorator => {
	return function (target) {
		CommandSetConfig.set(target, cmdSet => {
			cmdSet.clients.push({client, version});
			return cmdSet;
		});
	};
};

export const CommandSetAuthenticated = (status: boolean = true): ClassDecorator => {
	return function (target) {
		CommandSetConfig.set(target, cmdSet => {
			cmdSet.authenticated = status;
			return cmdSet;
		});
	};
};
