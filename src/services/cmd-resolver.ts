import CmdResolver from "../lib/command/cmd-resolver.js";
import UserCmd from "../commands/user-cmd.js";
import cacheFactory from "./cache-factory.js";
import {clients} from "../app/clients.js";
import PostCmd from "../commands/post-cmd.js";
import logger from "./logger.js";

const cmdResolver = new CmdResolver(
    clients,
    cacheFactory(),
	logger,
    UserCmd,
	PostCmd
);

export default cmdResolver;