import {Response} from "express";

export abstract class ResponseType {
	abstract send(res: Response): Promise<unknown>;
}