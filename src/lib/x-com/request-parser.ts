import {Request} from "express";
import {Files, IRequestParser} from "./types";
import FileField from "./file-field";
import {xComError} from "./errors";


export default class RequestParser implements IRequestParser{
	parse(req: Request): { type: "json" | "form-data", args: Record<string, any>, files: Files } {
		let type: "json" | "form-data";
		let args;
		let files: Files = {};
		if (req.is("application/json")) {
			type = "json";
			args = req.body;
		} else if (req.is("multipart/form-data")) {
			type = "form-data";
			args = req.body;
			if (req.files !== undefined) {
				for (const file of req.files as Array<Express.Multer.File>) {
					if (files[file.fieldname] === undefined) files[file.fieldname] = [];
					files[file.fieldname].push(new FileField(file.originalname, file.mimetype, file.size, file.buffer));
				}
			}
		} else {
			throw xComError.requestTypeNotAccepted();
		}
		return {type, args, files};
	}
}