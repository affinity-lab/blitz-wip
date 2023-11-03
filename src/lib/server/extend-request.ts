import {NextFunction, Request, Response} from "express";


export function extendRequest() {
    return (req: Request, res: Response, next: NextFunction): void => {
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
    };
}
