import {XComConfig} from "../../config";

export const Command = (alias?: string): MethodDecorator => {
	return function (target, propertyKey) {
		XComConfig.set(target.constructor, cmdSet => {
			const cmd = cmdSet.getCmd(propertyKey);
			if (alias) cmd.alias = alias;
			return cmdSet;
		});
	};
};