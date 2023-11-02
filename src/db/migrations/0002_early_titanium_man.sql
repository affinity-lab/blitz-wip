CREATE TABLE `posts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255),
	`authorId` int,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
