import {char, int, mysqlTable, serial, text, varchar} from "drizzle-orm/mysql-core";
import {relations} from "drizzle-orm";

export const post = mysqlTable("posts", {
	id: serial("id").primaryKey(),
	title: varchar("title", {length: 255}),
	authorId: int("authorId")
});

export const postRelations = relations(post, ({ one }) => ({author: one(user, {fields: [post.authorId], references: [user.id]})}))

export const user = mysqlTable("users", {
	id: serial("id").primaryKey(),
	fullName: text("full_name"),
	phone: varchar("phone", {length: 255}),
	password: char("password", {length: 255})
});

export const userRelations = relations(user, ({ many }) => ({posts: many(post)}))