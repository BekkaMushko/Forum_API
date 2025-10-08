const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const Like = require('../models/like');
const Topic = require('../models/topic');
const pool = require('../db').promise();

module.exports = class ModelsHelpers {
  static async delete_comments(comments) {
    try {
      if (comments instanceof Array) {
        for (let i of comments) {
          if (i.id) {
            await ModelsHelpers.delete_comments((await Comment.get_all({ value: i.id, param: 'parent_comment' })).data);
            await Like.delete_all(i, 'comment');
            await new Comment(i).delete();
          } else {
            return false;
          }
        }
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  static async delete_post(post_obj) {
    try {
      if (post_obj) {
        await Like.delete_all(post_obj, 'post');
        await ModelsHelpers.delete_comments((await Comment.get_all({ value: post_obj.id, param: 'post' })).data);
        return await new Post(post_obj).delete();
      } else {
        return null;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  static async delete_user(user) {
    try {
      if (user) {
        const likes = (await pool.query('SELECT * FROM \`likes\` WHERE \`author\` = ?', user))[0];
        for (let i of likes) {
          await new Like(i).delete();
        }
        await ModelsHelpers.delete_comments((await Comment.get_all({ value: user, param: 'author' })).data);
        const posts = (await Post.get_all({ value: user, param: 'author' })).data;
        for (let i of posts) {
          await ModelsHelpers.delete_post(i);
        }
        return await new User({ id: user }).delete();
      } else {
        return null;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  }
  
  static async change_post_with_topic(post_obj, topic) {
    try {
      if (post_obj && topic) {
        let post_likes = await Like.get_likes(post_obj.id, 'post');
        const post_author = new User();
        await post_author.find(post_obj.author);
        await post_author.change_rating(post_obj.topic, (post_likes.dislike || 0) - (post_likes.like || 0));
        await post_author.change_rating(topic, (post_likes.like || 0) - (post_likes.dislike || 0));
        post_obj.topic = topic;
        const post_topic = new Topic();
        await post_topic.find(topic);
        const delete_categories_connections = [];
        for (let i = 0; i < post_obj.categories.length; ++i) {
          if (!(await post_topic.is_category_connected(post_obj.categories[i].id))) {
            await pool.query(`DELETE FROM \`posts_categories\` WHERE \`post\` = ? AND \`category\` = ?`, [post_obj.id, post_obj.categories[i].id]);
            delete_categories_connections.push(i);
          }
        }
        for (let i = delete_categories_connections.length - 1; i >= 0; --i) {
          post_obj.categories.splice(delete_categories_connections[i], 1);
        }
        const result = await new Post(post_obj).save();
        const comments = (await Comment.get_all({ value: post_obj.id, param: 'post' })).data;
        const changeCommentsTopic = async function(comms) {
          for (let i of comms) {
            let comment_likes = await Like.get_likes(i.id, 'comment');
            const comment_author = new User();
            await comment_author.find(i.author);
            await comment_author.change_rating(i.topic, (comment_likes.dislike || 0) - (comment_likes.like || 0));
            await comment_author.change_rating(topic, (comment_likes.like || 0) - (comment_likes.dislike || 0));
            await changeCommentsTopic((await Comment.get_all({ value: i.id, param: 'parent_comment' })).data);
            await new Comment(i).save();
          }
        }
        await changeCommentsTopic(comments);
        return result;
      } else {
        return false;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  static async delete_topic(topic) {
    try {
      if (topic) {
        const posts = (await Post.get_all({ value: topic, param: 'topic' })).data;
        for (let i of posts) {
          await ModelsHelpers.delete_post(i);
        }
        return await new Topic({ id: topic }).delete();
      } else {
        return null;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}

