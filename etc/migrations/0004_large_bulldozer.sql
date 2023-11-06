ALTER TABLE `verification` MODIFY COLUMN `email` varchar(255);--> statement-breakpoint
ALTER TABLE `verification` ADD `code` varchar(32);