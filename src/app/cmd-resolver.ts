import CommandResolver from "../lib/express-command-api/command-resolver";
import UserCmd from "../commands/user-cmd";
import PostCmd from "../commands/post-cmd";
import logger from "../services/logger";
import {Request} from "express";
import {Jwt} from "../lib/jwt";
import cacheFactory from "../services/cache-factory";


const onRequestAccepted = (req: Request) => logger.request(`${req.id}: (${req.context.get("request-type")}) ${req.url} - Authenticated: ${Jwt.getStringContent(req.context.get("authenticated"))}`);
const cacheReader = cacheFactory()?.getReader();

const cmdResolver = new CommandResolver(
	[UserCmd, PostCmd],
	{onRequestAccepted, cacheReader}
);


export default cmdResolver;
