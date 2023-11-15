import {XComConfig} from "../../config";

export const CommandAuthenticated = (status: boolean = true): MethodDecorator => {
	return function (target, propertyKey) {
		XComConfig.set(target.constructor, cmdSet => {
			const cmd = cmdSet.getCmd(propertyKey);
			cmd.authenticated = status;
			return cmdSet;
		});
	};
};