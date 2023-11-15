import {NextFunction, Request, Response} from "express";
import {ExtendedError} from "./extended-error";
import {EventEmitter} from "events";
import {XERROR} from "./events";

export function exceptionHandler(eventEmitter?: EventEmitter) {
	return async (error: Error | ExtendedError, req: Request, res: Response, next: NextFunction): Promise<void> => {
		eventEmitter?.emit(XERROR.ERROR, error, req);
		if (error instanceof ExtendedError) {
			res.status(error.httpResponseCode);
			res.json(
				error.silent
				? {message: error.message, code: error.code}
				: {message: error.message, code: error.code, details: error.details}
			);
		} else {
			res.status(500);
			res.json({error: error.message});
		}
		next();
	};
}
