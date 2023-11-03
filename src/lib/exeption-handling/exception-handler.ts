import {NextFunction, Request, Response} from "express";
import {Logger} from "./logger.js";
import {BlitzError} from "./error";

export function exceptionHandler(logger: Logger) {
	return async (error: Error | BlitzError, req: Request, res: Response, next: NextFunction): Promise<void> => {
		res.status(500);
		if(error instanceof BlitzError) {
			logger.error(`${error.message}`)
			res.json(error);
		}
		else {
			logger.error(`${error}`)
			res.json({error: error.message});
		}

		next();
	};
}
