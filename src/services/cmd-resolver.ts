import CmdResolver from "../lib/command/cmd-resolver.js";
import UserCmd from "../commands/user-cmd.js";
import cacheFactory from "./cache-factory.js";
import {clients} from "../app/clients.js";

const cmdResolver = new CmdResolver(
    clients,
    cacheFactory(),
    UserCmd
);

export default cmdResolver;