const User = require('../../models/user');
const ModelsHelpers = require('../../helpers/models_helpers');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

module.exports = {
  getAll: async (req, res) => {
    let { value, param, order_by, asc, limit, offset } = req.query ? req.query:{};
    if ((typeof param != 'undefined' && !(param instanceof Array
                                          ? param.every((p) => { return Object.keys((new User()).data).includes(p) })
                                          : Object.keys((new User()).data).includes(param)))
        || (typeof order_by != 'undefined' && !(Object.keys((new User()).data).includes(order_by)))
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
        case 'email_confirmed':
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
    try {
      asc = typeof asc != 'undefined' ? (asc == 'true' || asc == '1' ? true:false):undefined;
      limit = typeof limit != 'undefined' ? Number.parseInt(limit):undefined;
      offset = typeof offset != 'undefined' ? Number.parseInt(offset):undefined;
      const result = await User.get_all({ value, param, order_by, asc, limit, offset });
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
    if (isNaN(req.params.user_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid user ID value"
      });
    }
    try {
      const result = await new User().find(req.params.user_id);
      if (result == null) {
        return res.status(404).json({
          status: false,
          error: 'User is not found'
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
    const { login, password, password_confirmation, email, role } = req.body ? req.body:{};
    try {
      if (typeof login == 'undefined'
          || typeof password == 'undefined' || typeof password_confirmation == 'undefined'
          || typeof email == 'undefined' || typeof role == 'undefined') {
        return res.status(422).json({
          status: false,
          error: 'Missing parameters'
        });
      }
      if (typeof login != 'string' || /\W/.test(login) || !/\w{3,}/.test(login)) {
        return res.status(400).json({
          status: false,
          error: 'Login must be a string with at least 3 symbols length and can contain only uppercase/lowercase letters and digits'
        });
      }
      if (typeof password != 'string' || /\W/.test(password) || !/\w{6,}/.test(password)) {
        return res.status(400).json({
          status: false,
          error: 'Password must be a string with at least 6 symbols length and can contain only uppercase/lowercase letters and digits'
        });
      }
      if (password != password_confirmation) {
        return res.status(400).json({
          status: false,
          error: 'Passwords do not match'
        });
      }
      if (typeof email != 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          status: false,
          error: 'Invalid email'
        });
      }
      if (typeof role != 'string' || !['user', 'admin'].includes(role)) {
        return res.status(400).json({
          status: false,
          error: 'Invalid role'
        });
      }
      if (typeof req.body.email_confirmed != 'undefined' && isNaN(req.body.email_confirmed)) {
        return res.status(400).json({
          status: false,
          error: 'Invalid email confirmation status'
        });
      }
      if (typeof req.body.full_name != 'undefined' && typeof req.body.full_name != 'string') {
        return res.status(400).json({
          status: false,
          error: 'Full name must be a string'
        });
      }
      if (typeof req.body.description != 'undefined' && typeof req.body.description != 'string') {
        return res.status(400).json({
          status: false,
          error: 'Description must be a string'
        });
      }
      delete req.body.profile_picture;
      const user_by_login = await new User().find(login, 'login');
      if (user_by_login) {
        return res.status(409).json({
          status: false,
          error: 'User with such login already exist'
        });
      }
      let key = crypto.createHash('sha512').update('1234567890', 'utf-8').digest('hex').slice(0, 32);
      let iv = crypto.createHash('sha512').update('abcdef', 'utf-8').digest('hex').slice(0, 16);
      const encryptor = crypto.createCipheriv('AES-256-CBC', key, iv);
      req.body.password = Buffer.from(encryptor.update(req.body.password, 'utf8', 'base64') + encryptor.final('base64'))
                                .toString('base64');
      delete req.body.id;
      const result = await new User(req.body).save();
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

  uploadProfilePicture: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(422).json({
          status: false,
          error: 'Missing file'
        });
      }
      const user = new User();
      if (!(await user.find(req.user.id || req.user.login, req.user.id ? undefined:'login'))) {
        return res.status(404).json({
          status: false,
          error: 'User is not found'
        });
      }
      if (user.data.profile_picture) {
        fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', user.data.profile_picture));
      }
      user.data.profile_picture = req.file.filename;
      if (!(await user.save())) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else {
        return res.status(201).json({
          status: true,
          data: user.data.profile_picture
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

  deleteProfilePicture: async (req, res) => {
    try {
      const user = await new User();
      if (!(await user.find(req.user.id || req.user.login, req.user.id ? undefined:'login'))) {
        return res.status(404).json({
          status: false,
          error: 'User is not found'
        });
      }
      let result = user.data.profile_picture;
      fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', result));
      user.data.profile_picture = null;
      if (!(await user.save())) {
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

  updateOne: async (req, res) => {
    if (isNaN(req.params.user_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid user ID value"
      });
    }
    try {
      const user = await new User().find(req.params.user_id);
      if (!user) {
        return res.status(404).json({
          status: false,
          error: 'User is not found'
        });
      }
      if (typeof req.body.login != 'undefined' && req.user.id == req.params.user_id && req.body.login != user.login) {
        if (typeof req.body.login != 'string' || /\W/.test(req.body.login) || !/\w{3,}/.test(req.body.login)) {
          return res.status(400).json({
            status: false,
            error: 'Login must be a string at least 3 symbols length and can contain only uppercase/lowercase letters and digits'
          });
        }
        const user_by_login = await new User().find(req.body.login, 'login');
        if (user_by_login) {
          return res.status(409).json({
            status: false,
            error: 'User with such login already exist'
          });
        }
      } else {
        delete req.body.login;
      }
      delete req.body.email_confirmed;
      if (typeof req.body.email != 'undefined' && req.user.id == req.params.user_id && req.body.email != user.email) {
        if (typeof req.body.email != 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
          return res.status(400).json({
            status: false,
            error: 'Invalid email'
          });
        } else {
          req.body.email_confirmed = false;
        }
      } else {
        delete req.body.email;
      }
      if (typeof req.body.role != 'undefined'
          && req.user.role == 'admin' && !['user', 'admin'].includes(req.body.role)) {
        return res.status(400).json({
          status: false,
          error: 'Invalid role'
        });
      } else if (req.user.role != 'admin' || req.body.role == user.role) {
        delete req.body.role;
      }
      if (typeof req.body.full_name != 'undefined' && typeof req.body.full_name != 'string') {
        return res.status(400).json({
          status: false,
          error: 'Full name must be a string'
        });
      } else if (req.user.id != req.params.user_id || req.body.full_name == user.full_name) {
        delete req.body.full_name;
      }
      if (typeof req.body.description != 'undefined' && typeof req.body.description != 'string') {
        return res.status(400).json({
          status: false,
          error: 'Description must be a string'
        });
      } else if (req.user.id != req.params.user_id || req.body.description == user.description) {
        delete req.body.description;
      }
      delete req.body.id;
      delete req.body.password;
      delete req.body.profile_picture;
      if (Object.keys(req.body).length == 0
          || Object.keys(req.body).every((param) => { return !(typeof req.body[param] != 'undefined' && Object.keys((new User()).data).includes(param)) })) {
        return res.status(400).json({
          status: false,
          error: 'No new data to change current one'
        });
      }
      req.body.id = req.params.user_id;
      const result = await new User(req.body).save();
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
    if (isNaN(req.params.user_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid user ID value"
      });
    }
    try {
      const user = await new User().find(req.params.user_id);
      if (!user) {
        return res.status(404).json({
          status: false,
          error: 'User is not found'
        });
      }
      const result = await ModelsHelpers.delete_user(req.params.user_id);
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

  getRatings: async (req, res) => {
    if (isNaN(req.params.user_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid user ID value"
      });
    }
    try {
      const user = await new User().find(req.params.user_id);
      if (!user) {
        return res.status(404).json({
          status: false,
          error: 'User is not found'
        });
      }
      const result = await new User({ id: req.params.user_id }).get_ratings();
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

  getFollowings: async (req, res) => {
    try {
      const result = await new User({ id: req.user.id }).get_following_users();
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
    if (isNaN(req.params.user_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid user ID value"
      });
    }
    try {
      const user = await new User().find(req.params.user_id);
      if (!user) {
        return res.status(404).json({
          status: false,
          error: 'User is not found'
        });
      }
      if (user.id == req.user.id) {
        return res.status(403).json({
          status: false,
          error: "Can't follow yourself"
        });
      }
      const result = await new User({ id: req.user.id }).follow_user(user.id);
      if (result === null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else if (result === false) {
        return res.status(400).json({
          status: false,
          error: 'User is already followed'
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
    if (isNaN(req.params.user_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid user ID value"
      });
    }
    try {
      const user = await new User().find(req.params.user_id);
      if (!user) {
        return res.status(404).json({
          status: false,
          error: 'User is not found'
        });
      }
      const result = await new User({ id: req.user.id }).unfollow_user(user.id);
      if (result === null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else if (result === false) {
        return res.status(400).json({
          status: false,
          error: 'No such user in followings to delete'
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

