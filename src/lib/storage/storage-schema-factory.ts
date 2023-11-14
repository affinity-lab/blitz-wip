import {int, json, mysqlTable, serial, varchar,unique } from "drizzle-orm/mysql-core";

export function storageSchemaFactory(name: string = "_storage") {
	return mysqlTable(name, {
			id: serial("id").primaryKey(),
			name: varchar("name", {length: 255}).notNull(),
			itemId: int("itemId").notNull(),
			data: json("data").default("{}")
		},
		(t) => ({
			unq: unique().on(t.name, t.itemId)
		})
	);
}
