const express = require('express');
const db = require('./db');

const api_auth_router = require('./routes/api/auth');
const api_users_router = require('./routes/api/users');
const api_posts_router = require('./routes/api/posts');
const api_comments_router = require('./routes/api/comments');
const api_topics_router = require('./routes/api/topics');
const api_categories_router = require('./routes/api/categories');
const api_notifications_router = require('./routes/api/notifications');

const app = express();

const hostname = 'localhost';
const port = 3000;

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded());

app.use('/api/auth', api_auth_router);
app.use('/api/users', api_users_router);
app.use('/api/posts', api_posts_router);
app.use('/api/comments', api_comments_router);
app.use('/api/topics', api_topics_router);
app.use('/api/categories', api_categories_router);
app.use('/api/notifications', api_notifications_router);

app.use((req, res) => {
    res.status(404).json({
      error: 'Endpoint is not found'
    });
});

db.connect((err) => {
  if (err) {
    console.error(err);
  } else {
    app.listen(port, () => {
      console.log(`Server running at http://${hostname}:${port}`);
    });
  }
});

