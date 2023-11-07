import CommandResolver from "../lib/x-com-api/command-resolver";
import UserXCom from "../commands/user-x-com";
import PostXCom from "../commands/post-x-com";
import logger from "../services/logger";
import {Request} from "express";
import {Jwt} from "../lib/jwt";
import cacheFactory from "../services/cache-factory";


const onRequestAccepted = (req: Request) => logger.request(`${req.id}: (${req.context.get("request-type")}) ${req.url} - Authenticated: ${Jwt.getStringContent(req.context.get("authenticated"))}`);
const cacheReader = cacheFactory()?.getReader();

const commandResolver = new CommandResolver(
	[UserXCom, PostXCom],
	{onRequestAccepted, cacheReader}
);


export default commandResolver;
