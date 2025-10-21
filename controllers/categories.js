const Category = require('../models/category');
const Post = require('../models/post');

module.exports = {
  getAll: async (req, res) => {
    let { value, param, order_by, asc, limit, offset } = req.query ? req.query:{};
    if ((typeof param != 'undefined' && !(param instanceof Array
                                          ? param.every((p) => { return Object.keys((new Category()).data).includes(p) })
                                          : Object.keys((new Category()).data).includes(param)))
        || (typeof order_by != 'undefined' && !(Object.keys((new Category()).data).includes(order_by)))
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
      const result = await Category.get_all({ value, param, order_by, asc, limit, offset });
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
    if (isNaN(req.params.category_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid category ID value"
      });
    }
    try {
      const result = await new Category().find(req.params.category_id);
      if (result == null) {
        return res.status(404).json({
          status: false,
          error: 'Category is not found'
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
      const category_by_title = await new Category().find(title, 'title');
      if (category_by_title) {
        return res.status(409).json({
          status: false,
          error: 'Category with such title already exist'
        });
      }
      delete req.body.id;
      const result = await new Category(req.body).save();
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
    if (isNaN(req.params.category_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid category ID value"
      });
    }
    try {
      const category = await new Category().find(req.params.category_id);
      if (!category) {
        return res.status(404).json({
          status: false,
          error: 'Category is not found'
        });
      }
      if (typeof req.body.title != 'undefined' && req.body.title != category.title) {
        if (typeof req.body.title != 'string' || req.body.title.length > 30) {
          return res.status(400).json({
            status: false,
            error: 'Title must be a string with maximum 30 characters length'
          });
        }
        const category_by_title = await new Category().find(req.body.title, 'title');
        if (category_by_title) {
          return res.status(409).json({
            status: false,
            error: 'Category with such title already exist'
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
      } else if (req.body.description == category.description) {
        delete req.body.description;
      }
      delete req.body.id;
      if (Object.keys(req.body).length == 0
          || Object.keys(req.body).every((param) => { return !(typeof req.body[param] != 'undefined' && Object.keys((new Category()).data).includes(param)) })) {
        return res.status(400).json({
          status: false,
          error: 'No new data to change current one'
        });
      }
      req.body.id = req.params.category_id;
      const result = await new Category(req.body).save();
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
    if (isNaN(req.params.category_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid category ID value"
      });
    }
    try {
      const category = new Category();
      if (!(await category.find(req.params.category_id))) {
        return res.status(404).json({
          status: false,
          error: 'Category is not found'
        });
      }
      const result = await category.delete();
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
    if (isNaN(req.params.category_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid category ID value"
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
    let deleteIdx = [];
    for (let i = 0; i < value.length; ++i) {
      if (['id', 'title', 'content', 'image', 'categories'].includes(param[i] || 'id')) {
        deleteIdx.push(i);
      }
    }
    for (let i = deleteIdx.length - 1; i >= 0; --i) {
      value.splice(deleteIdx[i], 1);
      param.splice(deleteIdx[i], 1);
    }
    value.push(req.params.category_id);
    param.push('categories');
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
  }
};

