import {createErrorData, preprocessErrorTree} from "../lib/error/preprocess-error-tree";


export const appError = {
	auth: {
		verificationCode: () => createErrorData("Invalid verification!"),
	}
};

preprocessErrorTree(appError, "APP");