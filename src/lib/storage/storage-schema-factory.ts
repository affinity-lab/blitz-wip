import {int, json, mysqlTable, serial, varchar} from "drizzle-orm/mysql-core";

export function storageSchemaFactory(name: string = "_storage") {
	return mysqlTable(name, {
		id: serial("id").primaryKey(),
		entity: varchar("name", {length: 255}).notNull().unique("entity"),
		entityId: int("itemId").notNull().unique("entity"),
		data: json("data").default("{}")
	});
}
