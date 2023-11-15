import {XComConfig} from "../../config";

export const XComAuthenticated = (status: boolean = true): ClassDecorator => {
	return function (target) {
		XComConfig.set(target, cmdSet => {
			cmdSet.authenticated = status;
			return cmdSet;
		});
	};
};
