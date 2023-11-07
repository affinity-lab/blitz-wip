import {CacheOptions, IClient} from "./types";
import {XComConfig} from "./x-com-api";

export class CommandConfig {
	alias: string;
	cache?: CacheOptions;
	clients: Array<{ client: IClient, version: number | Array<number>, cache: boolean | CacheOptions }> = [];
	authenticated?: boolean;
	sanitize?: (args: Record<string, any>) => Record<string, any>;
	validate?: (args: Record<string, any>) => Record<string, any>;

	constructor(public func: string) {this.alias = func;}
}


export const Command = (alias?: string): MethodDecorator => {
	return function (target, propertyKey) {
		XComConfig.set(target.constructor, cmdSet => {
			const cmd = cmdSet.getCmd(propertyKey);
			if (alias) cmd.alias = alias;
			return cmdSet;
		});
	};
};


export const CommandCache = (cache: CacheOptions): MethodDecorator => {
	return function (target, propertyKey) {
		XComConfig.set(target.constructor, cmdSet => {
			const cmd = cmdSet.getCmd(propertyKey);
			cmd.cache = cache;
			return cmdSet;
		});
	};
};

export const CommandAuthenticated = (status: boolean = true): MethodDecorator => {
	return function (target, propertyKey) {
		XComConfig.set(target.constructor, cmdSet => {
			const cmd = cmdSet.getCmd(propertyKey);
			cmd.authenticated = status;
			return cmdSet;
		});
	};
};
export const CommandClient = (client: IClient, version: number | Array<number> = 1, cache: boolean | CacheOptions = true): MethodDecorator => {
	return function (target, propertyKey) {
		XComConfig.set(target.constructor, cmdSet => {
			const cmd = cmdSet.getCmd(propertyKey);
			cmd.clients.push({client, version, cache});
			return cmdSet;
		});
	};
};

