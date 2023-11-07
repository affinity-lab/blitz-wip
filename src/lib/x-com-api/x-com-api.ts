import {IClient} from "./types";
import {CommandConfig} from "./x-com-command";

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


export const XCom = (alias?: string): ClassDecorator => {
	return function (target) {
		XComConfig.set(target, cmdSet => {
			if (alias) cmdSet.alias = alias;
			return cmdSet;
		});
	};
};

export const XComClient = (client: IClient, version: number | Array<number> = 1): ClassDecorator => {
	return function (target) {
		XComConfig.set(target, cmdSet => {
			cmdSet.clients.push({client, version});
			return cmdSet;
		});
	};
};

export const XComAuthenticated = (status: boolean = true): ClassDecorator => {
	return function (target) {
		XComConfig.set(target, cmdSet => {
			cmdSet.authenticated = status;
			return cmdSet;
		});
	};
};
