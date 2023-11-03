import "dotenv/config";
import {drizzle, MySql2Database} from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import schema from "./@schema.js";
import {migrate} from "drizzle-orm/mysql2/migrator";
import cfg from "../services/config.js";
import {dataSourceStorage} from "../services/storage.js";


let db: () => MySql2Database<typeof schema> = () => dataSourceStorage["default"] as MySql2Database<typeof schema>;

export async function dbFactory(): Promise<MySql2Database<typeof schema>> {
	let connection = await mysql.createConnection(cfg.database.url);
	let db = drizzle(connection, {mode: "default", schema, logger: true});
	await migrate(db, { migrationsFolder: cfg.database.migration });
	return db;
}

// (async () => {
// 	let connection = await mysql.createConnection(cfg.database.url);
// 	db = drizzle(connection, {mode: "default", schema, logger: true});
// 	await migrate(db, { migrationsFolder: cfg.database.migration });
// })


export default db;
