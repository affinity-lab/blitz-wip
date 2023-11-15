import {CacheOptions, IClient} from "../../types";
import {XComConfig} from "../../config";

export const CommandClient = (client: IClient, version: number | Array<number> = 1, cache: boolean | CacheOptions = true): MethodDecorator => {
	return function (target, propertyKey) {
		XComConfig.set(target.constructor, cmdSet => {
			const cmd = cmdSet.getCmd(propertyKey);
			cmd.clients.push({client, version, cache});
			return cmdSet;
		});
	};
};