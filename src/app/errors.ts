import {createErrorData, preprocessErrorTree} from "../lib/util/extended-error/preprocess-error-tree";


export const appError = {
	auth: {
		verificationCode: () => createErrorData("Invalid verification!"),
	}
};

preprocessErrorTree(appError, "APP");