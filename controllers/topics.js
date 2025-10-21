const Topic = require('../models/topic');
const Post = require('../models/post');
const ModelsHelpers = require('../helpers/models_helpers');

module.exports = {
  getAll: async (req, res) => {
    let { value, param, order_by, asc, limit, offset } = req.query ? req.query:{};
    if ((typeof param != 'undefined' && !(param instanceof Array
                                          ? param.every((p) => { return Object.keys((new Topic()).data).includes(p) })
                                          : Object.keys((new Topic()).data).includes(param)))
        || (typeof order_by != 'undefined' && !(Object.keys((new Topic()).data).includes(order_by)))
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
    try {
      asc = typeof asc != 'undefined' ? (asc == 'true' || asc == '1' ? true:false):undefined;
      limit = typeof limit != 'undefined' ? Number.parseInt(limit):undefined;
      offset = typeof offset != 'undefined' ? Number.parseInt(offset):undefined;
      const result = await Topic.get_all({ value, param, order_by, asc, limit, offset });
      if (result == null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else {
        return res.status(200).json({
          status: true,
          data: result.data,
          count: result.count
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
    if (isNaN(req.params.topic_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid topic ID value"
      });
    }
    try {
      const result = await new Topic().find(req.params.topic_id);
      if (result == null) {
        return res.status(404).json({
          status: false,
          error: 'Topic is not found'
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
    const title = req.body ? req.body.title:undefined;
    try {
      if (typeof title == 'undefined') {
        return res.status(422).json({
          status: false,
          error: 'Missing parameters'
        });
      }
      if (typeof title != 'string' || title.length > 30) {
        return res.status(400).json({
          status: false,
          error: 'Title must be a string with maximum 30 characters length'
        });
      }
      if (typeof req.body.description != 'undefined' && typeof req.body.description != 'string') {
        return res.status(400).json({
          status: false,
          error: 'Description must be a string'
        });
      }
      const topic_by_title = await new Topic().find(title, 'title');
      if (topic_by_title) {
        return res.status(409).json({
          status: false,
          error: 'Topic with such title already exist'
        });
      }
      delete req.body.id;
      const result = await new Topic(req.body).save();
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
  },

  updateOne: async (req, res) => {
    if (isNaN(req.params.topic_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid topic ID value"
      });
    }
    try {
      const topic = await new Topic().find(req.params.topic_id);
      if (!topic) {
        return res.status(404).json({
          status: false,
          error: 'Topic is not found'
        });
      }
      if (typeof req.body.title != 'undefined' && req.body.title != topic.title) {
        if (typeof req.body.title != 'string' || req.body.title.length > 30) {
          return res.status(400).json({
            status: false,
            error: 'Title must be a string with maximum 30 characters length'
          });
        }
        const topic_by_title = await new Topic().find(req.body.title, 'title');
        if (topic_by_title) {
          return res.status(409).json({
            status: false,
            error: 'Topic with such title already exist'
          });
        }
      } else {
        delete req.body.title;
      }
      if (typeof req.body.description != 'undefined' && typeof req.body.description != 'string') {
        return res.status(400).json({
          status: false,
          error: 'Description must be a string'
        });
      } else if (req.body.description == topic.description) {
        delete req.body.description;
      }
      delete req.body.id;
      if (Object.keys(req.body).length == 0
          || Object.keys(req.body).every((param) => { return !(typeof req.body[param] != 'undefined' && Object.keys((new Topic()).data).includes(param)) })) {
        return res.status(400).json({
          status: false,
          error: 'No new data to change current one'
        });
      }
      req.body.id = req.params.topic_id;
      const result = await new Topic(req.body).save();
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

  deleteOne: async (req, res) => {
    if (isNaN(req.params.topic_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid topic ID value"
      });
    }
    try {
      const topic = await new Topic().find(req.params.topic_id);
      if (!topic) {
        return res.status(404).json({
          status: false,
          error: 'Topic is not found'
        });
      }
      const result = await ModelsHelpers.delete_topic(topic.id);
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

  getPosts: async (req, res) => {
    if (isNaN(req.params.topic_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid topic ID value"
      });
    }
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
    let deleteIdx = [];
    for (let i = 0; i < value.length; ++i) {
      if (['id', 'title', 'content', 'image', 'topic'].includes(param[i] || 'id')) {
        deleteIdx.push(i);
      }
    }
    for (let i = deleteIdx.length - 1; i >= 0; --i) {
      value.splice(deleteIdx[i], 1);
      param.splice(deleteIdx[i], 1);
    }
    value.push(req.params.topic_id);
    param.push('topic');
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
          data: result.data,
          count: result.count
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

  getCategories: async (req, res) => {
    if (isNaN(req.params.topic_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid topic ID value"
      });
    }
    let { limit, offset } = req.query ? req.query:{};
    if ((typeof limit != 'undefined' && isNaN(limit)) || (typeof offset != 'undefined' && isNaN(offset))) {
      return res.status(400).json({
        status: false,
        error: 'Invalid query values'
      });
    }
    try {
      const topic = new Topic();
      if (!(await topic.find(req.params.topic_id))) {
        return res.status(404).json({
          status: false,
          error: 'Topic is not found'
        });
      }
      limit = typeof limit != 'undefined' ? Number.parseInt(limit):undefined;
      offset = typeof offset != 'undefined' ? Number.parseInt(offset):undefined;
      const result = await topic.get_categories({ limit: limit, offset: offset });
      if (result == null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else {
        return res.status(200).json({
          status: true,
          data: result.data,
          count: result.count
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

  isCategoryConnected: async (req, res) => {
    if (isNaN(req.params.topic_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid topic ID value"
      });
    }
    try {
      const topic = new Topic();
      if (!(await topic.find(req.params.topic_id))) {
        return res.status(404).json({
          status: false,
          error: 'Topic is not found'
        });
      }
      if (typeof req.body.category != 'number') {
        return res.status(400).json({
          status: false,
          error: 'Category must be provided as ID (number)'
        });
      }
      const result = await topic.is_category_connected(req.body.category);
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

  connectCategory: async (req, res) => {
    if (isNaN(req.params.topic_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid topic ID value"
      });
    }
    try {
      const topic = new Topic();
      if (!(await topic.find(req.params.topic_id))) {
        return res.status(404).json({
          status: false,
          error: 'Topic is not found'
        });
      }
      if (typeof req.body.category != 'number') {
        return res.status(400).json({
          status: false,
          error: 'Category must be provided as ID (number)'
        });
      }
      const result = await topic.connect_category(req.body.category);
      if (result === null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else if (result === false) {
        return res.status(400).json({
          status: false,
          error: 'Category is already connected'
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

  disconnectCategory: async (req, res) => {
    if (isNaN(req.params.topic_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid topic ID value"
      });
    }
    try {
      const topic = new Topic();
      if (!(await topic.find(req.params.topic_id))) {
        return res.status(404).json({
          status: false,
          error: 'Topic is not found'
        });
      }
      if (typeof req.body.category != 'number') {
        return res.status(400).json({
          status: false,
          error: 'Category must be provided as ID (number)'
        });
      }
      const result = await topic.disconnect_category(req.body.category);
      if (result === null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else if (result === false) {
        return res.status(400).json({
          status: false,
          error: 'Category is already disconnected'
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

