import {ResponseType} from "../responseType";
import {Response} from "express";

class ResponseJson extends ResponseType{
	constructor(readonly result:any) {super();}
	async send(res: Response) {
		return res.json(this.result)
	}
}