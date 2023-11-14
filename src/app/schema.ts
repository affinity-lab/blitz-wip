import {char, int, mysqlTable, serial, varchar, timestamp, json} from "drizzle-orm/mysql-core";
import {relations} from "drizzle-orm";
import {storageSchemaFactory} from "../lib/storage/storage-schema-factory";

export const post = mysqlTable("posts", {
	id: serial("id").primaryKey(),
	title: varchar("title", {length: 255}),
	authorId: int("authorId")
})

export const postRelations = relations(post, ({ one }) => ({author: one(user, {fields: [post.authorId], references: [user.id]})}))

export const user = mysqlTable("users", {
	id: serial("id").primaryKey(),
	name: varchar("name", {length: 255}),
	email: varchar("email", {length: 255}),
	password: char("password", {length: 255})
})

export const userRelations = relations(user, ({ many }) => ({posts: many(post)}))

export const verification = mysqlTable("verification", {
	id: serial("id").primaryKey(),
	email: varchar("email", {length: 255}),
	code: varchar("code", {length: 36}),
	created: timestamp("created").defaultNow()
})

export const storage = storageSchemaFactory();