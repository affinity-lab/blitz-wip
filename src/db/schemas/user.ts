import {mysqlTable, serial, text, varchar} from "drizzle-orm/mysql-core";


const schema = mysqlTable("users", {
	id: serial("id").primaryKey(),
	fullName: text("full_name"),
	phone: varchar("phone", {length: 256})
});

export default schema;