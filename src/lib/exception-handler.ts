import {NextFunction, Request, Response} from "express";
import {Logger} from "./logger";
import {BlitzError} from "./error/blitz-error";

export function exceptionHandler(logger: Logger) {
    return async (error: Error | BlitzError, req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (error instanceof BlitzError) {
            res.status(error.httpResponseCode);
            logger.error(`${req.id}: ${error.message}`);
			res.json(error);
        } else {
            res.status(500);
            logger.error(`${req.id}: ${error}`);
            res.json({error: error.message});
        }
        next();
    };
}
