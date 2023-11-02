import "dotenv/config";
import {drizzle} from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import schema from "./@schema.js";
import {migrate} from "drizzle-orm/mysql2/migrator";

let connection = await mysql.createConnection(process.env.DATABASE_URL as string);
let db = drizzle(connection, {mode: "default", schema, logger: true});

await migrate(db, { migrationsFolder: "src/db/migrations" });
export default db;
