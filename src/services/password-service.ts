import {Password} from "../lib/password.js";
import cfg from "./config.js";

export const passwordService: Password = new Password(Buffer.from(cfg.crypto.pepper));
