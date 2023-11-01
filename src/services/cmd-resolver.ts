import CmdResolver from "../lib/command/cmd-resolver.js";
import UserCmd from "../commands/user-cmd.js";
import cacheFactory from "./cache-factory.js";
import {Request} from "express";
import {clients} from "../app/clients.js";

const cmdResolver = new CmdResolver(clients, UserCmd);
cmdResolver.cache = cacheFactory();
cmdResolver.authResolver = (req: Request) => req.getHeader("auth");
export default cmdResolver;