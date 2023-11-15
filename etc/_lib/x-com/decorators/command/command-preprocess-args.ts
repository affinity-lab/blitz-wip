import {XComConfig} from "../../config";


export const CommandPreprocessArgs = function (sanitize: (args: Record<string, any>) => Record<string, any>): MethodDecorator {
	return function (target: object, propertyKey: string | symbol) {
		XComConfig.set(target.constructor, cmdSet => {
			const cmd = cmdSet.getCmd(propertyKey);
			cmd.sanitize = sanitize;
			return cmdSet;
		});
	};
};
