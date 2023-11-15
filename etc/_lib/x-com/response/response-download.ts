import {ResponseType} from "../responseType";
import {Response} from "express";

class ResponseDownload extends ResponseType {
	constructor(readonly result: any, readonly filename: string) {super();}

	async send(res: Response) {
		res.attachment(this.filename);
		res.send(this.result);
	}
}