const express = require('express');
const db = require('./db');
const path = require('path');
const cors = require('cors');

const api_auth_router = require('./routes/auth');
const api_users_router = require('./routes/users');
const api_posts_router = require('./routes/posts');
const api_comments_router = require('./routes/comments');
const api_topics_router = require('./routes/topics');
const api_categories_router = require('./routes/categories');
const api_notifications_router = require('./routes/notifications');

const app = express();

const hostname = 'localhost';
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded());
app.use(cors({ credentials: true, origin: '*' }));

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
      console.log(`API server running at http://${hostname}:${port}`);
    });
  }
});

