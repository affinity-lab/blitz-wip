import {Password} from "../lib/password";
import cfg from "./config";

export const passwordService: Password = new Password(Buffer.from(cfg.crypto.passwordPepper));
