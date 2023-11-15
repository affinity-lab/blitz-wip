import {ExtendedError} from "./extended-error";

export function fatalError(message: string = "fatal extended-error occurred", info: Record<string, any> = {}): ExtendedError {
	return new ExtendedError(message, "FATAL_ERROR", undefined, 500, true);
}
