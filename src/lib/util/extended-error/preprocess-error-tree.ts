import {ExtendedError} from "./extended-error";
import {snakeCase} from "change-case-all";

export function preprocessErrorTree(errors: Record<string, any>, prefix: string = ""): void {
	for (const prop of Object.getOwnPropertyNames(errors)) {
		if (typeof errors[prop] === "object") {
			preprocessErrorTree(errors[prop], prefix + "_" + prop);
		} else if (typeof errors[prop] === "function") {
			const originalMethod = errors[prop];
			const code: string = snakeCase(prefix + "_" + prop).toUpperCase();
			errors[prop] = (...args: Array<any>) => {
				const errorData: ErrorData = {code, ...originalMethod(...args)};
				if (errorData.message === undefined) errorData.message = code;
				return new ExtendedError(errorData.message, code, errorData.details, errorData.httpResponseCode, errorData.silent);
			};
		}
	}
}

type ErrorData = { message?: string, details?: Record<string, any>, httpResponseCode: number, silent: boolean }

export function createErrorData(
	message?: string,
	details?: Record<string, any>,
	httpResponseCode: number = 500,
	silent: boolean = false
): ErrorData {
	const error: ErrorData = {httpResponseCode, silent, details: undefined, message: undefined};
	if (typeof details !== "undefined") error.details = details;
	if (typeof message !== "undefined") error.message = message;
	return error;
}
