import {type MySql2Database} from "drizzle-orm/mysql2";
import * as schema from "../../app/schema";
import {STORAGE} from "../storage";

export const db = STORAGE["db"] as MySql2Database<typeof schema>;
