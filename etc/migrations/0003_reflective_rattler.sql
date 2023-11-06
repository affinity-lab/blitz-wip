CREATE TABLE `verification` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`email` varchar(32),
	`created` timestamp DEFAULT (now()),
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN `full_name` TO `name`;--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN `phone` TO `email`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `name` varchar(255);