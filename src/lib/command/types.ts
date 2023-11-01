import {Request} from "express";

export type Args = Record<string, any>

export type CacheDef = {
    ttl: number,
    user?: boolean,
    cttl?: number
}

export type CommandSet = {};

export type CommandFunc = (args: Args, req: Request) => Promise<any>;