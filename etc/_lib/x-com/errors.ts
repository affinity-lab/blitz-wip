import {createErrorData, preprocessErrorTree} from "../util/extended-error/preprocess-error-tree";

export const xComError = {
	notFound: (message: string) => createErrorData(message, undefined, 404),
	clientNotAuthorized: () => createErrorData("client not authorized", undefined, 403),
	userNotAuthenticated: () => createErrorData("user not authorized", undefined, 401),
	requestTypeNotAccepted: () => createErrorData("request type not accepted")
};

preprocessErrorTree(xComError, "X-COM");