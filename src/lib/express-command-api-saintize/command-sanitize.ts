import {CommandSetConfig} from "../express-command-api/command";


export const CommandSanitize = function validateArgs(sanitize: (args: Record<string, any>) => Record<string, any>): MethodDecorator {
	return function (target: object, propertyKey: string | symbol) {
		CommandSetConfig.set(target.constructor, cmdSet => {
			const cmd = cmdSet.getCmd(propertyKey);
			cmd.sanitize = sanitize;
			return cmdSet;
		});
	};
};
