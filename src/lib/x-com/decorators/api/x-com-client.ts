import {IClient} from "../../types";
import {XComConfig} from "../../config";

export const XComClient = (client: IClient, version: number | Array<number> = 1): ClassDecorator => {
	return function (target) {
		XComConfig.set(target, cmdSet => {
			cmdSet.clients.push({client, version});
			return cmdSet;
		});
	};
};
