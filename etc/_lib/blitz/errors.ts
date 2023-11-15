import {createErrorData, preprocessErrorTree} from "../util/extended-error/preprocess-error-tree";

export const blitzError = {
	storage: {
		ownerNotExists: (name: string, id: number) =>
			createErrorData("file can not be added to non existing owner", {name, id}, 500),
		fileTooLarge: (name: string, id: number, filename: string, sizeLimit: number) =>
			createErrorData("file size is too large", {name, id, filename, sizeLimit}, 500),
		extensionNotAllowed: (name: string, id: number, filename: string, allowedExtensions: string | Array<string>) =>
			createErrorData("file extension is not allowed", {name, id, filename, allowedExtensions}, 500),
		tooManyFiles: (name: string, id: number, filename: string, limit: number) =>
			createErrorData("no more files allowed", {name, id, filename, limit}, 500),
		attachedFileNotFound: (name: string, id: number, filename: string) =>
			createErrorData("attached file not found", {name, id, filename}, 500)
	}
};

preprocessErrorTree(blitzError, "BLITZ");