import {createErrorData, preprocessErrorTree} from "@affinity-lab/affinity-util";

export const appError = {
	auth: {
		verificationCode: () => createErrorData("Invalid verification!"),
	}
};

preprocessErrorTree(appError, "APP");