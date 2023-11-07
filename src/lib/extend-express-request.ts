import {NextFunction, Request, Response} from "express";
import crypto from "crypto";


export function extendExpressRequest(req: Request, res: Response, next: NextFunction): void {
	req.id = crypto.randomInt(999999999).toString().padStart(9, "0").replace(/(\d{3})(\d{3})(\d{3})/, "$1-$2-$3");
	req.context = new Map();
	req.hasHeader = function (header: string): boolean {
		return this.headers[header] !== undefined;
	};
	req.getHeader = function (header: string): string | undefined {
		if (!this.hasHeader(header)) return undefined;
		let value = this.headers[header];
		if (typeof value === "string") return value;
		if (Array.isArray(value) && value.length > 0) return value[0];
		return undefined;
	};
	req.getNumHeader = function (header: string): number | undefined {
		let value: string | number | undefined = this.getHeader(header);
		if (value === undefined) return undefined;
		value = parseInt(value);
		return Number.isNaN(value) ? undefined : value;
	};
	return next();
}
