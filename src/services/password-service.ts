import cfg from "./config";
import {Password} from "@affinity-lab/affinity-util";

export const passwordService: Password = new Password(Buffer.from(cfg.crypto.passwordPepper));
