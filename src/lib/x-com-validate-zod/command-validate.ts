import {z} from "zod";
import {BlitzError} from "../error/blitz-error";
import {XComConfig} from "../x-com-api/x-com-api";

export const CommandValidate = function validateArgs(zodPattern: z.ZodObject<any>): MethodDecorator {
	return function (target: object, propertyKey: string | symbol) {
		XComConfig.set(target.constructor, cmdSet => {
			const cmd = cmdSet.getCmd(propertyKey);
			cmd.validate = (args: Record<string, any>) => {
				let parsed = zodPattern.safeParse(args);
				if (!parsed.success) throw new BlitzError("Validation error", "VALIDATION_ERROR", parsed.error.issues);
				return parsed.data;
			};
			return cmdSet;
		});
	};
};