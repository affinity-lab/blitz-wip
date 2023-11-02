import "dotenv/config";
import {drizzle} from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import schema from "./@schema.js";

let connection = await mysql.createConnection(process.env.DATABASE_URL as string);
let db = drizzle(connection, {mode: "default", schema, logger: true});

export default db;
