import {XComConfig} from "../x-com-api/x-com-api";


export const CommandSanitize = function validateArgs(sanitize: (args: Record<string, any>) => Record<string, any>): MethodDecorator {
	return function (target: object, propertyKey: string | symbol) {
		XComConfig.set(target.constructor, cmdSet => {
			const cmd = cmdSet.getCmd(propertyKey);
			cmd.sanitize = sanitize;
			return cmdSet;
		});
	};
};
