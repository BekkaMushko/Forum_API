use Forum_API;

INSERT INTO `topics` (`title`, `description`) VALUES
    ('Topic1', 'Description of this topic'),
    ('Topic2', '...'),
    ('Topic3', 'third topic'),
    ('Test topic', 'test'),
    ('Topic without description', NULL);

INSERT INTO `categories` (`title`, `description`) VALUES
    ('Category1', 'Description'),
    ('Category2', '2'),
    ('New category', 'new'),
    ('Test category', 'test'),
    ('Test', 'test'),
    ('Category without description', NULL),
    ('Seventh', '7'),
    ('Eighth', '8');

INSERT INTO `topics_categories` (`category`, `topic`) VALUES
    ((SELECT `id` FROM `categories` WHERE `title` = 'Category1'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic1')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Category2'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic1')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Test category'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic1')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Test'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic1')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Category without description'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic1')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Category1'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic2')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Category2'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic2')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'New category'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic2')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Test category'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic2')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Test'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic2')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Category without description'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic2')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Seventh'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic2')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Eighth'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic2')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Category1'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic3')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Category2'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic3')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'New category'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic3')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Test category'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic3')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Test'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic3')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Category without description'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic3')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Seventh'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic3')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Category1'), (SELECT `id` FROM `topics` WHERE `title` = 'Test topic')),
    ((SELECT `id` FROM `categories` WHERE `title` = 'Category without description'), (SELECT `id` FROM `topics` WHERE `title` = 'Test topic'));

INSERT INTO `users` (`login`, `password`, `full_name`, `email`, `email_confirmed`, `description`, `role`) VALUES
    ('admin', 'S2NFd1VZWURBYUpPVSs1OFJ0WG9Wdz09', NULL, 'admin@example.com', 1, NULL, 'admin'),
    ('user1', 'S2NFd1VZWURBYUpPVSs1OFJ0WG9Wdz09', NULL, 'user1@example.com', 1, NULL, 'user'),
    ('user2', 'S2NFd1VZWURBYUpPVSs1OFJ0WG9Wdz09', NULL, 'user2@example.com', 1, NULL, 'user'),
    ('GoodUser', 'S2NFd1VZWURBYUpPVSs1OFJ0WG9Wdz09', 'Good user', 'gooduser@example.com', 1, NULL, 'admin'),
    ('BadUser', 'S2NFd1VZWURBYUpPVSs1OFJ0WG9Wdz09', 'Bad user', 'baduser@example.com', 1, 'Dislike everything', 'user');

INSERT INTO `posts` (`author`, `title`, `type`, `status`, `content`, `topic`) VALUES
    ((SELECT `id` FROM `users` WHERE `login` = 'user1'), 'first post', 'post', 'active', 'This is my first post', (SELECT `id` FROM `topics` WHERE `title` = 'Topic1')),
    ((SELECT `id` FROM `users` WHERE `login` = 'user1'), 'first question', 'question', 'inactive', 'This is my first question', (SELECT `id` FROM `topics` WHERE `title` = 'Topic3')),
    ((SELECT `id` FROM `users` WHERE `login` = 'user2'), 'test post', 'post', 'active', 'test', (SELECT `id` FROM `topics` WHERE `title` = 'Topic2')),
    ((SELECT `id` FROM `users` WHERE `login` = 'user2'), 'good post', 'post', 'inactive', 'good test', (SELECT `id` FROM `topics` WHERE `title` = 'Topic2')),
    ((SELECT `id` FROM `users` WHERE `login` = 'BadUser'), 'bad post', 'post', 'active', 'bad post', (SELECT `id` FROM `topics` WHERE `title` = 'Topic1'));

INSERT INTO `posts_categories` (`post`, `category`) VALUES
    ((SELECT `id` FROM `posts` WHERE `title` = 'first post'), (SELECT `id` FROM `categories` WHERE `title` = 'Category1')),
    ((SELECT `id` FROM `posts` WHERE `title` = 'first post'), (SELECT `id` FROM `categories` WHERE `title` = 'Test category')),
    ((SELECT `id` FROM `posts` WHERE `title` = 'first post'), (SELECT `id` FROM `categories` WHERE `title` = 'Seventh')),
    ((SELECT `id` FROM `posts` WHERE `title` = 'first question'), (SELECT `id` FROM `categories` WHERE `title` = 'Seventh')),
    ((SELECT `id` FROM `posts` WHERE `title` = 'first question'), (SELECT `id` FROM `categories` WHERE `title` = 'Category without description')),
    ((SELECT `id` FROM `posts` WHERE `title` = 'first question'), (SELECT `id` FROM `categories` WHERE `title` = 'Category1')),
    ((SELECT `id` FROM `posts` WHERE `title` = 'good post'), (SELECT `id` FROM `categories` WHERE `title` = 'Seventh')),
    ((SELECT `id` FROM `posts` WHERE `title` = 'bad post'), (SELECT `id` FROM `categories` WHERE `title` = 'Category1')),
    ((SELECT `id` FROM `posts` WHERE `title` = 'bad post'), (SELECT `id` FROM `categories` WHERE `title` = 'Eighth'));

INSERT INTO `comments` (`author`, `answer`, `content`, `topic`, `post`, `parent_comment`) VALUES
    ((SELECT `id` FROM `users` WHERE `login` = 'user2'), 0, 'first comment', (SELECT `topic` FROM `posts` WHERE `title` = 'first question'), (SELECT `id` FROM `posts` WHERE `title` = 'first question'), NULL),
    ((SELECT `id` FROM `users` WHERE `login` = 'user1'), 0, 'comment to comment', (SELECT `topic` FROM `posts` WHERE `title` = 'first question'), (SELECT `id` FROM `posts` WHERE `title` = 'first question'), 1),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), 1, 'answer', (SELECT `topic` FROM `posts` WHERE `title` = 'first question'), (SELECT `id` FROM `posts` WHERE `title` = 'first question'), NULL),
    ((SELECT `id` FROM `users` WHERE `login` = 'BadUser'), 0, 'bad comment', (SELECT `topic` FROM `posts` WHERE `title` = 'good post'), (SELECT `id` FROM `posts` WHERE `title` = 'good post'), NULL),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), 0, 'this is a bad comment', (SELECT `topic` FROM `posts` WHERE `title` = 'good post'), (SELECT `id` FROM `posts` WHERE `title` = 'good post'), 4);

INSERT INTO `likes` (`author`, `post`, `comment`, `type`) VALUES
    ((SELECT `id` FROM `users` WHERE `login` = 'user1'), NULL, (SELECT `id` FROM `comments` WHERE `content` = 'answer'), 'like'),
    ((SELECT `id` FROM `users` WHERE `login` = 'user2'), NULL, (SELECT `id` FROM `comments` WHERE `content` = 'answer'), 'like'),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), (SELECT `id` FROM `posts` WHERE `title` = 'first question'), NULL, 'like'),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), NULL, (SELECT `id` FROM `comments` WHERE `content` = 'bad comment'), 'dislike'),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), (SELECT `id` FROM `posts` WHERE `title` = 'good post'), NULL, 'like'),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), (SELECT `id` FROM `posts` WHERE `title` = 'bad post'), NULL, 'dislike'),
    ((SELECT `id` FROM `users` WHERE `login` = 'BadUser'), NULL, (SELECT `id` FROM `comments` WHERE `content` = 'this is a bad comment'), 'dislike'),
    ((SELECT `id` FROM `users` WHERE `login` = 'BadUser'), (SELECT `id` FROM `posts` WHERE `title` = 'good post'), NULL, 'dislike');

INSERT INTO `notifications` (`user`, `type`, `seen`, `notification_post`, `notification_comment`) VALUES
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), 'following_publication', 1, (SELECT `id` FROM `posts` WHERE `title` = 'first post'), NULL),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), 'following_publication', 1, (SELECT `id` FROM `posts` WHERE `title` = 'good post'), NULL),
    ((SELECT `id` FROM `users` WHERE `login` = 'user1'), 'new_comment', 1, NULL, (SELECT `id` FROM `comments` WHERE `content` = 'first comment')),
    ((SELECT `id` FROM `users` WHERE `login` = 'BadUser'), 'following_comment', 0, NULL, (SELECT `id` FROM `comments` WHERE `content` = 'first comment')),
    ((SELECT `id` FROM `users` WHERE `login` = 'user2'), 'new_comment', 0, NULL, (SELECT `id` FROM `comments` WHERE `content` = 'comment to comment')),
    ((SELECT `id` FROM `users` WHERE `login` = 'user1'), 'new_comment', 1, NULL, (SELECT `id` FROM `comments` WHERE `content` = 'answer')),
    ((SELECT `id` FROM `users` WHERE `login` = 'BadUser'), 'following_comment', 0, NULL, (SELECT `id` FROM `comments` WHERE `content` = 'answer')),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), 'answer', 1, NULL, (SELECT `id` FROM `comments` WHERE `content` = 'answer')),
    ((SELECT `id` FROM `users` WHERE `login` = 'user2'), 'new_comment', 1, NULL, (SELECT `id` FROM `comments` WHERE `content` = 'bad comment')),
    ((SELECT `id` FROM `users` WHERE `login` = 'BadUser'), 'new_comment', 0, NULL, (SELECT `id` FROM `comments` WHERE `content` = 'this is a bad comment'));

INSERT INTO `followings_posts` (`user`, `post`) VALUES
    ((SELECT `id` FROM `users` WHERE `login` = 'BadUser'), (SELECT `id` FROM `posts` WHERE `title` = 'first question')),
    ((SELECT `id` FROM `users` WHERE `login` = 'user1'), (SELECT `id` FROM `posts` WHERE `title` = 'bad post')),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), (SELECT `id` FROM `posts` WHERE `title` = 'first post')),
    ((SELECT `id` FROM `users` WHERE `login` = 'BadUser'), (SELECT `id` FROM `posts` WHERE `title` = 'test post')),
    ((SELECT `id` FROM `users` WHERE `login` = 'user1'), (SELECT `id` FROM `posts` WHERE `title` = 'test post'));

INSERT INTO `followings_users` (`user`, `following_user`) VALUES
    ((SELECT `id` FROM `users` WHERE `login` = 'user2'), (SELECT `id` FROM `users` WHERE `login` = 'GoodUser')),
    ((SELECT `id` FROM `users` WHERE `login` = 'user1'), (SELECT `id` FROM `users` WHERE `login` = 'GoodUser')),
    ((SELECT `id` FROM `users` WHERE `login` = 'user2'), (SELECT `id` FROM `users` WHERE `login` = 'user1')),
    ((SELECT `id` FROM `users` WHERE `login` = 'user1'), (SELECT `id` FROM `users` WHERE `login` = 'user2')),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), (SELECT `id` FROM `users` WHERE `login` = 'user1'));

INSERT INTO `favorite_posts` (`user`, `post`) VALUES
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), (SELECT `id` FROM `posts` WHERE `title` = 'first question')),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), (SELECT `id` FROM `posts` WHERE `title` = 'good post')),
    ((SELECT `id` FROM `users` WHERE `login` = 'BadUser'), (SELECT `id` FROM `posts` WHERE `title` = 'good post')),
    ((SELECT `id` FROM `users` WHERE `login` = 'user2'), (SELECT `id` FROM `posts` WHERE `title` = 'first question')),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), (SELECT `id` FROM `posts` WHERE `title` = 'first post'));

INSERT INTO `users_ratings` (`user`, `topic`, `rating`) VALUES
    ((SELECT `id` FROM `users` WHERE `login` = 'admin'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic1'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'admin'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic2'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'admin'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic3'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'admin'), (SELECT `id` FROM `topics` WHERE `title` = 'Test topic'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'admin'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic without description'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'user1'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic1'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'user1'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic2'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'user1'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic3'), 1),
    ((SELECT `id` FROM `users` WHERE `login` = 'user1'), (SELECT `id` FROM `topics` WHERE `title` = 'Test topic'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'user1'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic without description'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'user2'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic1'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'user2'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic2'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'user2'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic3'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'user2'), (SELECT `id` FROM `topics` WHERE `title` = 'Test topic'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'user2'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic without description'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic1'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic2'), -1),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic3'), 5),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), (SELECT `id` FROM `topics` WHERE `title` = 'Test topic'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'GoodUser'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic without description'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'BadUser'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic1'), -1),
    ((SELECT `id` FROM `users` WHERE `login` = 'BadUser'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic2'), -1),
    ((SELECT `id` FROM `users` WHERE `login` = 'BadUser'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic3'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'BadUser'), (SELECT `id` FROM `topics` WHERE `title` = 'Test topic'), 0),
    ((SELECT `id` FROM `users` WHERE `login` = 'BadUser'), (SELECT `id` FROM `topics` WHERE `title` = 'Topic without description'), 0);

