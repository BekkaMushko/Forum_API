const User = require('../../models/user');
const Post = require('../../models/post');
const Comment = require('../../models/comment');
const Like = require('../../models/like');
const Notification = require('../../models/notification');
const ModelsHelpers = require('../../helpers/models_helpers');
const path = require('path');
const fs = require('fs');

module.exports = {
  getOne: async (req, res) => {
    if (isNaN(req.params.comment_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid comment ID value"
      });
    }
    try {
      const result = await new Comment().find(req.params.comment_id);
      if (result == null) {
        return res.status(404).json({
          status: false,
          error: 'Comment is not found'
        });
      } else {
        return res.status(200).json({
          status: true,
          data: result
        });
      }
    } catch(err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        error: err
      });
    }
  },

  createOne: async (req, res) => {
    if (isNaN(req.params.comment_id)) {
      if (req.file) {
        fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
      }
      return res.status(400).json({
        status: false,
        error: "Invalid comment ID value"
      });
    }
    const content = req.body ? req.body.content:undefined;
    try {
      if (typeof content == 'undefined') {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(422).json({
          status: false,
          error: 'Missing parameters'
        });
      }
      if (typeof content != 'string') {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(400).json({
          status: false,
          error: 'Content must be a string'
        });
      }
      if (req.file) {
        req.body.image = req.file.filename;
      }
      const parent_comment = await new Comment().find(req.params.comment_id);
      if (!parent_comment) {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(404).json({
          status: false,
          error: 'Parent comment is not found'
        });
      }
      const post = await new Post().find(parent_comment.post);
      if (!post) {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(404).json({
          status: false,
          error: 'Parent post is not found'
        });
      }
      if (post.status == 'inactive') {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(405).json({
          status: false,
          error: "Can't comment under inactive post"
        });
      }
      req.body.author = req.user.id;
      req.body.topic = parent_comment.topic;
      req.body.post = parent_comment.post;
      req.body.parent_comment = parent_comment.id;
      delete req.body.id;
      delete req.body.publish_date;
      delete req.body.answer;
      if (!req.file) {
        delete req.body.image;
      }
      if (req.file) {
        delete req.body.image;
      }
      const result = await new Comment(req.body).save();
      if (result == null) {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else {
        return res.status(201).json({
          status: true,
          data: result
        });
      }
    } catch(err) {
      console.error(err);
      if (req.file) {
        fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
      }
      return res.status(500).json({
        status: false,
        error: err
      });
    }
  },

  updateOne: async (req, res) => {
    if (isNaN(req.params.comment_id)) {
      if (req.file) {
        fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
      }
      return res.status(400).json({
        status: false,
        error: "Invalid comment ID value"
      });
    }
    try {
      const comment = await new Comment().find(req.params.comment_id);
      if (!comment) {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(404).json({
          status: false,
          error: 'Comment is not found'
        });
      }
      if (typeof req.body.content != 'undefined' && typeof req.body.content != 'string') {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(400).json({
          status: false,
          error: 'Content must be a string'
        });
      } else if (comment.author != req.user.id || req.body.content == comment.content) {
        delete req.body.content;
      }
      if ((req.file || req.body.image === null) && comment.author == req.user.id) {
        req.body.image = req.file && req.body.image !== null ? req.file.filename:null;
      } else {
        delete req.body.image;
      }
      delete req.body.id;
      delete req.body.author;
      delete req.body.publish_date;
      delete req.body.answer;
      delete req.body.topic;
      delete req.body.post;
      delete req.body.parent_comment;
      if (Object.keys(req.body).length == 0
          || Object.keys(req.body).every((param) => { return !(typeof req.body[param] != 'undefined' && Object.keys((new Comment()).data).includes(param)) })) {
        return res.status(400).json({
          status: false,
          error: 'No new data to change current one'
        });
      }
      req.body.id = req.params.comment_id;
      const result = await new Comment(req.body).save();
      if (result == null) {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else {
        if ((req.file || req.body.image === null) && comment.author == req.user.id
            && comment.image && fs.existsSync(path.join(__dirname, '..', '..', 'public', 'images', comment.image))) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', comment.image));
        }
        return res.status(201).json({
          status: true,
          data: result
        });
      }
    } catch(err) {
      console.error(err);
      if (req.file) {
        fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
      }
      return res.status(500).json({
        status: false,
        error: err
      });
    }
  },

  deleteOne: async (req, res) => {
    if (isNaN(req.params.comment_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid comment ID value"
      });
    }
    try {
      const comment = new Comment();
      if (!(await comment.find(req.params.comment_id))) {
        return res.status(404).json({
          status: false,
          error: 'Comment is not found'
        });
      }
      await ModelsHelpers.delete_comments(await Comment.get_all({ value: comment.data.id, param: 'parent_comment' }));
      await Like.delete_all(comment.data, 'comment');
      const result = await comment.delete();
      if (result == null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else {
        return res.status(200).json({
          status: true,
          data: result
        });
      }
    } catch(err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        error: err
      });
    }
  },

  getComments: async (req, res) => {
    if (isNaN(req.params.comment_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid comment ID value"
      });
    }
    let { value, param, order_by, asc, limit, offset } = req.query ? req.query:{};
    if ((typeof param != 'undefined' && !(param instanceof Array
                                          ? param.every((p) => { return Object.keys((new Comment()).data).includes(p) })
                                          : Object.keys((new Comment()).data).includes(param)))
        || (typeof order_by != 'undefined' && !((Object.keys((new Comment()).data).concat(['rating'])).includes(order_by)))
        || (typeof asc != 'undefined' && !(['true', 'false', '1', '0'].includes(asc)))
        || (typeof limit != 'undefined' && isNaN(limit)) || (typeof offset != 'undefined' && isNaN(offset))) {
      return res.status(400).json({
        status: false,
        error: 'Invalid query values'
      });
    }
    if ((typeof param != 'undefined' && typeof value == 'undefined')
        || (param instanceof Array && (!(value instanceof Array) || param.length > value.lengt))) {
      return res.status(400).json({
        status: false,
        error: 'Parameters is given without their values'
      });
    }
    const checkAccordance = function(param, value, i) {
      switch (param[i]) {
        case 'author':
          return !isNaN(value[i]);
          break;
        case 'publish_date':
          try {
            value[i] = JSON.parse(value[i]);
            if (value[i] instanceof Array && value[i].length == 2) {
              for (let j = 0; j < 2; ++j) {
                value[i][j] = new Date(value[i]);
                if (isNaN(value[i][j])) {
                  return false;
                }
              }
              return true;
            } else {
              return false;
            }
          } catch {
            return false;
          }
          break;
        case 'answer':
          if (value[i] == 'true' || value[i] == '1') {
            value[i] = true;
            return true;
          } else if (value[i] == 'false' || value[i] == '0') {
            value[i] = false;
            return true;
          } else {
            return false;
          }
          break;
      }
      return true;
    };
    if (!(value instanceof Array)) {
      param = [typeof value != 'undefined' ? param || 'id':undefined];
      value = [value];
    }
    for (let i = 0; i < value.length; ++i) {
      if (!checkAccordance(param, value, i)) {
        return res.status(400).json({
          status: false,
          error: "Parameters don't match their values"
        });
      }
    }
    let deleteIdx = [];
    for (let i = 0; i < value.length; ++i) {
      if (['id', 'content', 'image', 'topic', 'post', 'parent_comment'].includes(param[i] || 'id')) {
        deleteIdx.push(i);
      }
    }
    for (let i = deleteIdx.length - 1; i >= 0; --i) {
      value.splice(deleteIdx[i], 1);
      param.splice(deleteIdx[i], 1);
    }
    value.push(req.params.comment_id);
    param.push('parent_comment');
    try {
      asc = typeof asc != 'undefined' ? (asc == 'true' || asc == '1' ? true:false):undefined;
      limit = typeof limit != 'undefined' ? Number.parseInt(limit):undefined;
      offset = typeof offset != 'undefined' ? Number.parseInt(offset):undefined;
      const result = await Comment.get_all({ value, param, order_by, asc, limit, offset });
      if (result == null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else {
        return res.status(200).json({
          status: true,
          data: result
        });
      }
    } catch(err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        error: err
      });
    }
  },

  getLikes: async (req, res) => {
    if (isNaN(req.params.comment_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid comment ID value"
      });
    }
    try {
      const comment = await new Comment().find(req.params.comment_id);
      if (comment == null) {
        return res.status(404).json({
          status: false,
          error: 'Comment is not found'
        });
      }
      const result = await Like.get_likes(comment.id, 'comment');
      if (result == null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else {
        return res.status(200).json({
          status: true,
          data: result
        });
      }
    } catch(err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        error: err
      });
    }
  },

  createLike: async (req, res) => {
    if (isNaN(req.params.comment_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid comment ID value"
      });
    }
    const type = req.body ? req.body.type:undefined;
    try {
      if (typeof type == 'undefined') {
        return res.status(422).json({
          status: false,
          error: 'Missing parameters'
        });
      }
      if (typeof type != 'string' || !['like', 'dislike'].includes(type)) {
        return res.status(400).json({
          status: false,
          error: 'Invalid like type'
        });
      }
      const comment = await new Comment().find(req.params.comment_id);
      if (comment == null) {
        return res.status(404).json({
          status: false,
          error: 'Comment is not found'
        });
      }
      if (comment.author == req.user.id) {
        return res.status(403).json({
          status: false,
          error: "Can't create a like under own comment"
        });
      }
      req.body.author = req.user.id;
      req.body.comment = comment.id;
      delete req.body.publish_date;
      delete req.body.post;
      const result = await new Like(req.body).save();
      if (result === null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else if (result === false) {
        return res.status(400).json({
          status: false,
          error: 'Like is already created'
        });
      } else {
        return res.status(200).json({
          status: true,
          data: result
        });
      }
    } catch(err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        error: err
      });
    }
  },

  deleteLike: async (req, res) => {
    if (isNaN(req.params.comment_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid comment ID value"
      });
    }
    try {
      const comment = await new Comment().find(req.params.comment_id);
      if (comment == null) {
        return res.status(404).json({
          status: false,
          error: 'Comment is not found'
        });
      }
      const result = await new Like({ author: req.user.id, comment: comment.id }).delete();
      if (result === null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else if (result === false) {
        return res.status(400).json({
          status: false,
          error: 'No like to delete'
        });
      } else {
        return res.status(200).json({
          status: true,
          data: result
        });
      }
    } catch(err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        error: err
      });
    }
  },

  markAnswer: async (req, res) => {
    if (isNaN(req.params.comment_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid comment ID value"
      });
    }
    try {
      const comment = await new Comment().find(req.params.comment_id);
      if (!comment) {
        return res.status(404).json({
          status: false,
          error: 'Comment is not found'
        });
      }
      if (comment.answer) {
        return res.status(400).json({
          status: false,
          error: 'This comment is already an answer'
        });
      }
      const post = await new Post().find(comment.post);
      if (!post) {
        return res.status(404).json({
          status: false,
          error: 'Parent post is not found'
        });
      }
      if (post.author != req.user.id) {
        return res.status(403).json({
          status: false,
          error: "Forbidden"
        });
      }
      if (post.type != 'question') {
        return res.status(400).json({
          status: false,
          error: "Can't mark answer under not question"
        });
      }
      if (post.status == 'inactive') {
        return res.status(405).json({
          status: false,
          error: "Can't mark answer under inactive question"
        });
      }
      post.status = 'inactive';
      if (!(await new Post(post).save())) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error during closing post'
        });
      }
      if (!(await new User({id: comment.author}).change_rating(comment.topic, 3))) {
        return res.status(500).json({
          status: false,
          error: "Internal server error during updating comment's author's rating"
        });
      }
      if (!(await new Notification({
                                      user: comment.author,
                                      type: 'answer',
                                      notification_comment: comment.id
                                    }).save())) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error during sending notification'
        });
      }
      comment.answer = true;
      const result = await new Comment(comment).save();
      if (result == null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else {
        return res.status(201).json({
          status: true,
          data: result
        });
      }
    } catch(err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        error: err
      });
    }
  }
};

