import {createErrorData, preprocessErrorTree} from "../lib/exeption-handling/preprocess-error-tree";


export const appError = {
	auth: {
		verificationCode: () => createErrorData("Invalid verification!"),
	}
};

preprocessErrorTree(appError, "APP");