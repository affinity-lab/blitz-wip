import {char, int, mysqlTable, serial, text, timestamp, varchar} from "drizzle-orm/mysql-core";
import {id, storageSchemaFactory} from "@affinity-lab/blitz";
import "drizzle-orm";


export const user = mysqlTable("users", {
	id: id(),
	name: varchar("name", {length: 255}),
	email: varchar("email", {length: 255}),
	password: char("password", {length: 255}),
	postId: int("postId"),
	bossId: int("bossId")
});


export const post = mysqlTable("posts", {
	id: id(),
	title: varchar("title", {length: 255}),
	authorId: int("authorId"),
	body: text("body")
});


export const verification = mysqlTable("verification", {
	id: serial("id").primaryKey(),
	email: varchar("email", {length: 255}),
	code: varchar("code", {length: 36}),
	created: timestamp("created").defaultNow()
});

export const storage = storageSchemaFactory();