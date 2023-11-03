import {MySql2Database} from "drizzle-orm/mysql2";


export const dataSourceStorage: Record<string, MySql2Database<any>> = {}