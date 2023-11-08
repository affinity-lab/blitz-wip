import {int, json, mysqlTable, serial, varchar} from "drizzle-orm/mysql-core";

export function attachmentSchemaFactory(name: string = "_attachments") {
	return mysqlTable(name, {
		id: serial("id").primaryKey(),
		entity: varchar("entity", {length: 255}).notNull().unique("entity"),
		entityId: int("entityId").notNull().unique("entity"),
		data: json("data").default("{}")
	});
}
