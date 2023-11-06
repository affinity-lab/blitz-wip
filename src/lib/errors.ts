import {createErrorData, preprocessErrorTree} from "./exeption-handling/preprocess-error-tree";
import {IClient} from "./client/client";
import {z} from "zod";
import Command from "./server/command/command";

export const blitzError = {
	command: {
		notFound: (message: string) => createErrorData(message, undefined, 404),
		clientNotAuthorized: () => createErrorData("client not authorized", undefined, 403),
		userNotAuthenticated: () => createErrorData("user not authorized", undefined, 401),
		requestTypeNotAccepted: ()=>createErrorData("request type not accepted"),
		validationError:(command:Command, issues:Array<z.ZodIssue>)=>createErrorData(`Error when calling ${command.client.name}.${command.version}/${command.command}`)
	}
};

preprocessErrorTree(blitzError, "BLITZ");