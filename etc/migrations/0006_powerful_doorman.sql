CREATE TABLE `_storage` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`itemId` int NOT NULL,
	`data` json DEFAULT ('{}'),
	CONSTRAINT `_storage_id` PRIMARY KEY(`id`)
);
