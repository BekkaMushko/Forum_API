const Post = require('../../models/post');
const User = require('../../models/user');
const Comment = require('../../models/comment');
const Like = require('../../models/like');
const Topic = require('../../models/topic');
const ModelsHelpers = require('../../helpers/models_helpers');
const path = require('path');
const fs = require('fs');

module.exports = {
  getAll: async (req, res) => {
    let { value, param, order_by, asc, limit, offset } = req.query ? req.query:{};
    if ((typeof param != 'undefined' && !(param instanceof Array
                                          ? param.every((p) => { return Object.keys((new Post()).data).includes(p) })
                                          : Object.keys((new Post()).data).includes(param)))
        || (typeof order_by != 'undefined' && (order_by == 'categories' || !((Object.keys((new Post()).data).concat(['rating'])).includes(order_by))))
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
        case 'id':
          return !isNaN(value[i]);
          break;
        case 'author':
          return !isNaN(value[i]);
          break;
        case 'publish_date':
          try {
            value[i] = JSON.parse(value[i]);
            if (value[i] instanceof Array && value[i].length == 2) {
              for (let j = 0; j < 2; ++j) {
                value[i][j] = new Date(value[i][j]);
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
        case 'topic':
          return !isNaN(value[i]);
          break;
        case 'categories':
          try {
            value[i] = JSON.parse(value[i]);
            if (value[i] instanceof Array) {
              for (let j of value[i]) {
                if (isNaN(j)) {
                  return false;
                }
              }
              return true;
            } else {
              return false;
            }
          } catch {
            return !isNaN(value[i]);
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
    try {
      asc = typeof asc != 'undefined' ? (asc == 'true' || asc == '1' ? true:false):undefined;
      limit = typeof limit != 'undefined' ? Number.parseInt(limit):undefined;
      offset = typeof offset != 'undefined' ? Number.parseInt(offset):undefined;
      const result = await Post.get_all({ value, param, order_by, asc, limit, offset });
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

  getOne: async (req, res) => {
    if (isNaN(req.params.post_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid post ID value"
      });
    }
    try {
      const result = await new Post().find(req.params.post_id);
      if (result == null) {
        return res.status(404).json({
          status: false,
          error: 'Post is not found'
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
    const { title, type, content, topic, categories } = req.body ? req.body:{};
    try {
      if (typeof title == 'undefined' || typeof type == 'undefined' || typeof content == 'undefined'
          || typeof topic == 'undefined' || typeof categories == 'undefined') {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(422).json({
          status: false,
          error: 'Missing parameters'
        });
      }
      if (typeof title != 'string') {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(400).json({
          status: false,
          error: 'Title must be a string'
        });
      }
      if (typeof type != 'string' || !['post', 'question'].includes(type)) {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(400).json({
          status: false,
          error: 'Invalid publication type'
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
      if (isNaN(topic)) {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(400).json({
          status: false,
          error: 'Topic must be provided as ID'
        });
      }
      const post_topic = new Topic();
      if (!(await post_topic.find(topic))) {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(404).json({
          status: false,
          error: 'Topic not found'
        });
      }
      if (!(categories instanceof Array)) {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(400).json({
          status: false,
          error: 'Categories must be provided an an array with IDs'
        });
      }
      for (let i of categories) {
        if (isNaN(i)) {
          if (req.file) {
            fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
          }
          return res.status(400).json({
            status: false,
            error: 'Invalid category in categories list'
          });
        }
      }
      const promisesArray = await Promise.all(categories.map(async (category) => { return { category: category, is_connected: await post_topic.is_category_connected(category) } }));
      req.body.categories = promisesArray.filter((category) => { return category.is_connected }).map(value => value.category);
      req.body.author = req.user.id;
      delete req.body.id;
      delete req.body.publish_date;
      delete req.body.status;
      if (!req.file) {
        delete req.body.image;
      }
      const result = await new Post(req.body).save();
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
    if (isNaN(req.params.post_id)) {
      if (req.file) {
        fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
      }
      return res.status(400).json({
        status: false,
        error: "Invalid post ID value"
      });
    }
    try {
      const post = await new Post().find(req.params.post_id);
      if (!post) {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(404).json({
          status: false,
          error: 'Post is not found'
        });
      }
      if (typeof req.body.title != 'undefined' && typeof req.body.title != 'string') {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(400).json({
          status: false,
          error: 'Title must be a string'
        });
      } else if (post.author != req.user.id || req.body.title == post.title) {
        delete req.body.title;
      }
      if (typeof req.body.status != 'undefined' && post.status != 'inactive'
          && (typeof req.body.status != 'string' || !['active', 'inactive'].includes(req.body.status))) {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(400).json({
          status: false,
          error: 'Invalid publication status'
        });
      } else if (post.status == 'inactive' || req.body.status == post.status) {
        delete req.body.status;
      }
      if (typeof req.body.content != 'undefined' && typeof req.body.content != 'string') {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(400).json({
          status: false,
          error: 'Content must be a string'
        });
      } else if (post.author != req.user.id || req.body.content == post.content) {
        delete req.body.content;
      }
      if ((req.file || req.body.image === null) && post.author == req.user.id) {
        req.body.image = req.file && req.body.image !== null ? req.file.filename:null;
      } else {
        delete req.body.image;
      }
      let post_topic = new Topic();
      await post_topic.find(post.topic);
      if (typeof req.body.topic != 'undefined' && isNaN(req.body.topic)) {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(400).json({
          status: false,
          error: 'Topic must be provided as ID'
        });
      } else if (req.body.topic == post.topic) {
        delete req.body.topic;
      } else if (typeof req.body.topic != 'undefined') {
        if (!(await post_topic.find(req.body.topic))) {
          if (req.file) {
            fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
          }
          return res.status(404).json({
            status: false,
            error: 'Topic is not found'
          });
        }
      }
      if (typeof req.body.categories != 'undefined' && !(req.body.categories instanceof Array)) {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(400).json({
          status: false,
          error: 'Categories must be provided an an array with IDs'
        });
      } else if (typeof req.body.categories != 'undefined'
          && req.body.categories.map(value => Number.parseInt(value)).every((category) => { return post.categories.map(value => value.id).includes(category) })
          && post.categories.map(value => value.id).every((category) => { return req.body.categories.map(value => Number.parseInt(value)).includes(category) })) {
        delete req.body.categories;
      } else if (typeof req.body.categories != 'undefined') {
        for (let i of req.body.categories) {
          if (isNaN(i)) {
            if (req.file) {
              fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
            }
            return res.status(400).json({
              status: false,
              error: 'Invalid category in categories list'
            });
          }
        }
        const promisesArray = await Promise.all(req.body.categories.map(async (category) => { return { category: category, is_connected: await post_topic.is_category_connected(category) } }));
        req.body.categories = promisesArray.filter((category) => { return category.is_connected }).map(value => value.category);
      }
      delete req.body.id;
      delete req.body.author;
      delete req.body.publish_date;
      delete req.body.type;
      if (Object.keys(req.body).length == 0
          || Object.keys(req.body).every((param) => { return !(typeof req.body[param] != 'undefined' && Object.keys((new Post()).data).includes(param)) })) {
        return res.status(400).json({
          status: false,
          error: 'No new data to change current one'
        });
      }
      req.body.id = req.params.post_id;
      req.body.categories = typeof req.body.categories == 'undefined'
                            ? post.categories
                            : req.body.categories.map((value) => { return { id: value } });
      let result = null;
      if (req.body.topic) {
        req.body.author = post.author;
        req.body.topic = post.topic;
        result = await ModelsHelpers.change_post_with_topic(req.body, post_topic.data.id);
      } else {
        result = await new Post(req.body).save();
      }
      if (result == null) {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else {
        if ((req.file || req.body.image === null) && post.author == req.user.id
            && post.image && fs.existsSync(path.join(__dirname, '..', '..', 'public', 'images', post.image))) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', post.image));
        }
        return res.status(200).json({
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
    if (isNaN(req.params.post_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid post ID value"
      });
    }
    try {
      const post = await new Post().find(req.params.post_id);
      if (!post) {
        return res.status(404).json({
          status: false,
          error: 'Post is not found'
        });
      }
      const result = await ModelsHelpers.delete_post(post);
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
    if (isNaN(req.params.post_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid post ID value"
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
    value.push(req.params.post_id);
    param.push('post');
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

  createComment: async (req, res) => {
    if (isNaN(req.params.post_id)) {
      if (req.file) {
        fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
      }
      return res.status(400).json({
        status: false,
        error: "Invalid post ID value"
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
      const post = await new Post().find(req.params.post_id);
      if (!post) {
        if (req.file) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', req.file.filename));
        }
        return res.status(404).json({
          status: false,
          error: 'Post is not found'
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
      req.body.topic = post.topic;
      req.body.post = post.id;
      req.body.parent_comment = null;
      delete req.body.id;
      delete req.body.publish_date;
      delete req.body.answer;
      if (!req.file) {
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

  getCategories: async (req, res) => {
    if (isNaN(req.params.post_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid post ID value"
      });
    }
    try {
      const post = new Post();
      if (!(await post.find(req.params.post_id))) {
        return res.status(404).json({
          status: false,
          error: 'Post is not found'
        });
      }
      const result = await post.get_categories();
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
    if (isNaN(req.params.post_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid post ID value"
      });
    }
    try {
      const post = await new Post().find(req.params.post_id);
      if (post == null) {
        return res.status(404).json({
          status: false,
          error: 'Post is not found'
        });
      }
      const result = await Like.get_likes(post.id, 'post');
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
    if (isNaN(req.params.post_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid post ID value"
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
      const post = await new Post().find(req.params.post_id);
      if (post == null) {
        return res.status(404).json({
          status: false,
          error: 'Post is not found'
        });
      }
      if (post.author == req.user.id) {
        return res.status(403).json({
          status: false,
          error: "Can't create a like under own publication"
        });
      }
      req.body.author = req.user.id;
      req.body.post = post.id;
      delete req.body.publish_date;
      delete req.body.comment;
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
    if (isNaN(req.params.post_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid post ID value"
      });
    }
    try {
      const post = await new Post().find(req.params.post_id);
      if (post == null) {
        return res.status(404).json({
          status: false,
          error: 'Post is not found'
        });
      }
      const result = await new Like({ author: req.user.id, post: post.id }).delete();
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

  getFavorites: async (req, res) => {
    try {
      const result = await new User({ id: req.user.id }).get_favorite();
      if (result === null) {
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

  addToFavorite: async (req, res) => {
    if (isNaN(req.params.post_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid post ID value"
      });
    }
    try {
      const post = await new Post().find(req.params.post_id);
      if (!post) {
        return res.status(404).json({
          status: false,
          error: 'Post is not found'
        });
      }
      const result = await new User({ id: req.user.id }).add_to_favorite(post.id);
      if (result === null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else if (result === false) {
        return res.status(400).json({
          status: false,
          error: 'Post is already if favorites'
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

  deleteFromFavorite: async (req, res) => {
    if (isNaN(req.params.post_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid post ID value"
      });
    }
    try {
      const post = await new Post().find(req.params.post_id);
      if (!post) {
        return res.status(404).json({
          status: false,
          error: 'Post is not found'
        });
      }
      const result = await new User({ id: req.user.id }).remove_from_favorite(post.id);
      if (result === null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else if (result === false) {
        return res.status(400).json({
          status: false,
          error: 'No such post in favorites to delete'
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

  getFollowings: async (req, res) => {
    try {
      const result = await new User({ id: req.user.id }).get_following_posts();
      if (result === null) {
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

  follow: async (req, res) => {
    if (isNaN(req.params.post_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid post ID value"
      });
    }
    try {
      const post = await new Post().find(req.params.post_id);
      if (!post) {
        return res.status(404).json({
          status: false,
          error: 'Post is not found'
        });
      }
      if (post.author == req.user.id) {
        return res.status(403).json({
          status: false,
          error: "Can't follow own post"
        });
      }
      if (post.status == 'inactive') {
        return res.status(403).json({
          status: false,
          error: "Can't follow inactive post"
        });
      }
      const result = await new User({ id: req.user.id }).follow_post(post.id);
      if (result === null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else if (result === false) {
        return res.status(400).json({
          status: false,
          error: 'Post is already followed'
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

  unfollow: async (req, res) => {
    if (isNaN(req.params.post_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid post ID value"
      });
    }
    try {
      const post = await new Post().find(req.params.post_id);
      if (!post) {
        return res.status(404).json({
          status: false,
          error: 'Post is not found'
        });
      }
      const result = await new User({ id: req.user.id }).unfollow_post(post.id);
      if (result === null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else if (result === false) {
        return res.status(400).json({
          status: false,
          error: 'No such post in followings to delete'
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

  searchByTitle: async (req, res) => {
    let { search_str, limit, offset } = req.query ? req.query:{};
    if (typeof search_str == 'undefined') {
      return res.status(400).json({
        status: false,
        error: 'Search string is required'
      });
    }
    if ((typeof limit != 'undefined' && isNaN(limit)) || (typeof offset != 'undefined' && isNaN(offset))) {
      return res.status(400).json({
        status: false,
        error: 'Invalid query values'
      });
    }
    try {
      limit = typeof limit != 'undefined' ? Number.parseInt(limit):undefined;
      offset = typeof offset != 'undefined' ? Number.parseInt(offset):undefined;
      const result = await Post.search_by_title(search_str, limit, offset);
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
  }
};

