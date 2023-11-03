import {MySql2Database} from "drizzle-orm/mysql2";
import * as schemas from "./schema";

export type SchemaType = typeof schemas;
export type DBType = MySql2Database<SchemaType>;