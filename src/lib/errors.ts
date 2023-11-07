import {createErrorData, preprocessErrorTree} from "./error/preprocess-error-tree";
import {z} from "zod";
import CommandHandler from "./express-command-api/command-handler";

export const blitzError = {
	command: {
		notFound: (message: string) => createErrorData(message, undefined, 404),
		clientNotAuthorized: () => createErrorData("client not authorized", undefined, 403),
		userNotAuthenticated: () => createErrorData("user not authorized", undefined, 401),
		requestTypeNotAccepted: ()=>createErrorData("request type not accepted"),
	}
};

preprocessErrorTree(blitzError, "BLITZ");