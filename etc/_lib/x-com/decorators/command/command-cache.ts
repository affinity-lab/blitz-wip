import {CacheOptions} from "../../types";
import {XComConfig} from "../../config";

export const CommandCache = (cache: CacheOptions): MethodDecorator => {
	return function (target, propertyKey) {
		XComConfig.set(target.constructor, cmdSet => {
			const cmd = cmdSet.getCmd(propertyKey);
			cmd.cache = cache;
			return cmdSet;
		});
	};
};