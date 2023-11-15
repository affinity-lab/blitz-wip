import {Password} from "../lib/util/password";
import cfg from "./config";

export const passwordService: Password = new Password(Buffer.from(cfg.crypto.passwordPepper));
