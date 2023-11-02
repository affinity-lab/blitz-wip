import {NextFunction, Request, Response} from "express";

export function exceptionHandler() {
	return async (error: Error, req: Request, res: Response, next: NextFunction): Promise<void> => {
		res.status(500);
		res.json({error: error.message});
		next();
	};
}
