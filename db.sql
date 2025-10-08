CREATE DATABASE IF NOT EXISTS Forum_API;
CREATE USER IF NOT EXISTS 'BekkaMushko'@'localhost' IDENTIFIED BY 'securepass';
GRANT ALL ON Forum_API.* TO 'BekkaMushko'@'localhost';
use Forum_API;
CREATE TABLE IF NOT EXISTS `users` (
	`id` integer PRIMARY KEY AUTO_INCREMENT,
	`login` varchar(30) NOT NULL UNIQUE,
	`password` text NOT NULL,
	`full_name` text,
	`email` text NOT NULL,
	`email_confirmed` boolean DEFAULT 0,
	`description` text,
	`profile_picture` text,
	`role` enum('admin', 'user') DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS `topics` (
	`id` integer PRIMARY KEY AUTO_INCREMENT,
	`title` varchar(30) NOT NULL UNIQUE,
	`description` text
);

CREATE TABLE IF NOT EXISTS `categories` (
	`id` integer PRIMARY KEY AUTO_INCREMENT,
	`title` varchar(30) NOT NULL UNIQUE,
	`description` text
);

CREATE TABLE IF NOT EXISTS `topics_categories` (
	`category` integer,
	`topic` integer,
	FOREIGN KEY (`topic`) REFERENCES `topics`(`id`),
	FOREIGN KEY (`category`) REFERENCES `categories`(`id`)
);

CREATE TABLE IF NOT EXISTS `posts` (
	`id` integer PRIMARY KEY AUTO_INCREMENT,
	`author` integer NOT NULL,
	`title` text NOT NULL,
	`publish_date` timestamp DEFAULT CURRENT_TIMESTAMP,
	`type` enum('post', 'question') NOT NULL,
	`status` enum('active', 'inactive') DEFAULT 'active',
	`content` text NOT NULL,
	`image` text DEFAULT NULL,
	`topic` integer NOT NULL,
	FOREIGN KEY (`author`) REFERENCES `users`(`id`),
	FOREIGN KEY (`topic`) REFERENCES `topics`(`id`)
);

CREATE TABLE IF NOT EXISTS `posts_categories` (
	`post` integer,
	`category` integer,
	FOREIGN KEY (`post`) REFERENCES `posts`(`id`),
	FOREIGN KEY (`category`) REFERENCES `categories`(`id`)
);

CREATE TABLE IF NOT EXISTS `users_ratings` (
	`user` integer,
	`topic` integer,
	`rating` integer DEFAULT 0,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`),
	FOREIGN KEY (`topic`) REFERENCES `topics`(`id`)
);

CREATE TABLE IF NOT EXISTS `favorite_posts` (
	`user` integer,
	`post` integer NOT NULL,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`),
	FOREIGN KEY (`post`) REFERENCES `posts`(`id`)
);

CREATE TABLE IF NOT EXISTS `followings_posts` (
	`user` integer,
	`post` integer,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`),
	FOREIGN KEY (`post`) REFERENCES `posts`(`id`)
);

CREATE TABLE IF NOT EXISTS `followings_users` (
	`user` integer,
	`following_user` integer,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`),
	FOREIGN KEY (`following_user`) REFERENCES `users`(`id`)
);

CREATE TABLE IF NOT EXISTS `comments` (
	`id` integer PRIMARY KEY AUTO_INCREMENT,
	`author` integer NOT NULL,
	`publish_date` timestamp DEFAULT CURRENT_TIMESTAMP,
	`status` enum('active', 'inactive') DEFAULT 'active',
	`answer` boolean DEFAULT 0,
	`content` text NOT NULL,
	`image` text DEFAULT NULL,
	`topic` integer NOT NULL,
	`post` integer,
	`parent_comment` integer,
	FOREIGN KEY (`author`) REFERENCES `users`(`id`),
	FOREIGN KEY (`topic`) REFERENCES `topics`(`id`),
	FOREIGN KEY (`post`) REFERENCES `posts`(`id`),
	FOREIGN KEY (`parent_comment`) REFERENCES `comments`(`id`)
);

CREATE TABLE IF NOT EXISTS `likes` (
	`author` integer NOT NULL,
	`publish_date` timestamp DEFAULT CURRENT_TIMESTAMP,
	`post` integer,
	`comment` integer,
	`type` enum('like', 'dislike') NOT NULL,
	FOREIGN KEY (`author`) REFERENCES `users`(`id`),
	FOREIGN KEY (`post`) REFERENCES `posts`(`id`),
	FOREIGN KEY (`comment`) REFERENCES `comments`(`id`)
);

CREATE TABLE IF NOT EXISTS `notifications` (
	`id` integer PRIMARY KEY AUTO_INCREMENT,
	`user` integer NOT NULL,
	`create_date` timestamp DEFAULT CURRENT_TIMESTAMP,
	`type` enum('new_comment', 'answer', 'following_publication', 'following_comment') NOT NULL,
	`seen` boolean DEFAULT 0,
	`notification_post` integer,
	`notification_comment` integer,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`),
	FOREIGN KEY (`notification_post`) REFERENCES `posts`(`id`),
	FOREIGN KEY (`notification_comment`) REFERENCES `comments`(`id`)
);

