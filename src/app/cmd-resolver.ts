import CmdResolver from "../lib/server/command/cmd-resolver";
import UserCmd from "../commands/user-cmd";
import cacheFactory from "../services/cache-factory";
import {clients} from "./clients";
import PostCmd from "../commands/post-cmd";
import logger from "../services/logger";

const cmdResolver = new CmdResolver(
    clients,
    cacheFactory(),
	logger,
    UserCmd,
	PostCmd
);

export default cmdResolver;
