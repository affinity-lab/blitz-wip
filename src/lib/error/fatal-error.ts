import {BlitzError} from "./blitz-error";

export function fatalError(message: string = "fatal error occurred", info: Record<string, any> = {}): BlitzError {
	return new BlitzError(message, "FATAL_ERROR", undefined, 500, true);
}
