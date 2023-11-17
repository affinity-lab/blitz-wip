CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255),
	`authorId` int,
	`body` text,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `_storage` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`itemId` int NOT NULL,
	`data` json DEFAULT ('{}'),
	CONSTRAINT `_storage_id` PRIMARY KEY(`id`),
	CONSTRAINT `_storage_name_itemId_unique` UNIQUE(`name`,`itemId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`email` varchar(255),
	`password` char(255),
	`postId` int,
	`bossId` int,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`email` varchar(255),
	`code` varchar(36),
	`created` timestamp DEFAULT (now()),
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
