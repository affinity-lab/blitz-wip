import {NextFunction, Request, Response} from "express";
import {Logger} from "../exeption-handling/logger";
import {BlitzError} from "../exeption-handling/error";

export function exceptionHandler(logger: Logger) {
    return async (error: Error | BlitzError, req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (error instanceof BlitzError) {
            res.status(error.httpResponseCode);
            logger.error(`${error.message}`);
            res.json(error);
        } else {
            res.status(500);
            logger.error(`${error}`);
            res.json({error: error.message});
        }
        next();
    };
}
