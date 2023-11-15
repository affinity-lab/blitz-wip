import {XComConfig} from "../../config";

export const XCom = (alias?: string): ClassDecorator => {
	return function (target) {
		XComConfig.set(target, cmdSet => {
			if (alias) cmdSet.alias = alias;
			return cmdSet;
		});
	};
};