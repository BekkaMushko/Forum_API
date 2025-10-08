const User = require('../../models/user');
const FunctionsHelpers = require('../../helpers/functions_helpers');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

module.exports = {
  register: async (req, res) => {
    let { login, password, password_confirmation, email } = req.body ? req.body:{};
    try {
      if (typeof login == 'undefined'
          || typeof password == 'undefined' || typeof password_confirmation == 'undefined'
          || typeof email == 'undefined') {
        return res.status(422).json({
          status: false,
          error: 'Missing parameters'
        });
      }
      if (typeof login != 'string' || /\W/.test(login) || !/^\w{3,30}$/.test(login)) {
        return res.status(400).json({
          status: false,
          error: 'Login must be a string with 3-30 symbols length and can contain only uppercase/lowercase letters, digits and underscore'
        });
      }
      if (typeof password != 'string' || /\W/.test(password)
          || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/\w{6,}/.test(password)) {
        return res.status(400).json({
          status: false,
          error: 'Password must be a string with at least 6 symbols length and must contain only and at least one uppercase/lowercase letter and digit'
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
      password = Buffer.from(encryptor.update(password, 'utf8', 'base64') + encryptor.final('base64'))
                       .toString('base64');
      const result = await new User({login: login, password: password, email: email}).save();
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

  login: async (req, res) => {
    try {
      if (req.headers.authorization) {
        let payload = jwt.verify(req.headers.authorization.split(' ')[1], '1a2b-3c4d-5e6f-7g8h');
        if (payload) {
          const user = await new User().find(payload.id);
          if (user && user.email_confirmed) {
            return res.status(400).json({
              status: false,
              message: 'There is already an authorized user'
            });
          }
        }
      }
    } catch {
      //
    }
    let { login, password, email } = req.body ? req.body:{};
    try {
      if (typeof login == 'undefined' || typeof password == 'undefined' || typeof email == 'undefined') {
        return res.status(422).json({
          status: false,
          error: 'Missing parameters'
        });
      }
      if (typeof login != 'string') {
        return res.status(400).json({
          status: false,
          error: 'Invalid login'
        });
      }
      if (typeof password != 'string') {
        return res.status(400).json({
          status: false,
          error: 'Invalid password'
        });
      }
      const user = await new User().find(login, 'login');
      if (!user) {
        return res.status(404).json({
          status: false,
          error: 'User is not found'
        });
      }
      if (!user.email_confirmed) {
        return res.status(403).json({
          status: false,
          error: 'Email is not confirmed'
        });
      }
      if (email != user.email) {
        return res.status(400).json({
          status: false,
          error: 'Incorrect email for user with this login'
        });
      }
      let key = crypto.createHash('sha512').update('1234567890', 'utf-8').digest('hex').slice(0, 32);
      let iv = crypto.createHash('sha512').update('abcdef', 'utf-8').digest('hex').slice(0, 16);
      const encryptor = crypto.createCipheriv('AES-256-CBC', key, iv);
      password = Buffer.from(encryptor.update(password, 'utf8', 'base64') + encryptor.final('base64'))
                       .toString('base64');
      if (password != user.password) {
        return res.status(400).json({
          status: false,
          error: 'Incorrect password for user with this login'
        });
      }
      return res.status(200).json({
        status: true,
        data: { data: user, token: FunctionsHelpers.create_token(user, 'user') }
      });
    } catch(err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        error: err
      });
    }
  },

  logout: async (req, res) => {
    return res.status(200).json({ status: true, data: req.user ? req.user.id:null });
  },

  send_email_confirm: async (req, res) => {
    let login = req.body ? req.body.login:undefined;
    try {
      if (typeof login == 'undefined') {
        return res.status(422).json({
          status: false,
          error: 'Missing parameters'
        });
      }
      if (typeof login != 'string') {
        return res.status(400).json({
          status: false,
          error: 'Invalid login'
        });
      }
      const user = await new User().find(login, 'login');
      if (!user) {
        return res.status(404).json({
          status: false,
          error: 'User is not found'
        });
      }
      if (!(await FunctionsHelpers.send_email(login, user.email, 'email', FunctionsHelpers.create_token(user, 'email')))) {
        return res.status(500).json({
          status: false,
          error: "Can't send email"
        });
      } else {
        return res.status(200).json({
          status: true,
          data: { data: user }
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

  confirm_email: async (req, res) => {
    let token_data = FunctionsHelpers.user_from_email(req.params.confirm_token);
    if (!token_data.status) {
      return res.status(token_data.message == 'Missing parameters' ? 422:401).json(token_data);
    }
    try {
      const user = await new User().find(token_data.user.id);
      if (!user) {
        return res.status(404).json({
          status: false,
          error: 'User is not found'
        });
      }
      user.email_confirmed = true;
      const result = await new User(user).save();
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

  send_password_reset: async (req, res) => {
    let login = req.body ? req.body.login:undefined;
    try {
      if (typeof login == 'undefined') {
        return res.status(422).json({
          status: false,
          error: 'Missing parameters'
        });
      }
      if (typeof login != 'string') {
        return res.status(400).json({
          status: false,
          error: 'Invalid login'
        });
      }
      const user = await new User().find(login, 'login');
      if (!user) {
        return res.status(404).json({
          status: false,
          error: 'User is not found'
        });
      }
      if (!user.email_confirmed) {
        return res.status(403).json({
          status: false,
          error: 'Email is not confirmed'
        });
      }
      if (!(await FunctionsHelpers.send_email(login, user.email, 'password', FunctionsHelpers.create_token(user, 'password')))) {
        return res.status(500).json({
          status: false,
          error: "Can't send email"
        });
      } else {
        return res.status(200).json({
          status: true,
          data: { data: user }
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

  reset_password: async (req, res) => {
    let password = req.body ? req.body.password:undefined;
    if (typeof password == 'undefined') {
      return res.status(422).json({
        status: false,
        error: 'Missing parameters'
      });
    }
    if (typeof password != 'string' || /\W/.test(password)
        || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/\w{6,}/.test(password)) {
      return res.status(400).json({
        status: false,
        error: 'Password must be a string with at least 6 symbols length and must contain only and at least one uppercase/lowercase letter and digit'
      });
    }
    let token_data = FunctionsHelpers.user_from_email(req.params.confirm_token);
    if (!token_data.status) {
      return res.status(token_data.message == 'Missing parameters' ? 422:401).json(token_data);
    }
    try {
      const user = await new User().find(token_data.user.id);
      if (!user) {
        return res.status(404).json({
          status: false,
          error: 'User is not found'
        });
      }
      let key = crypto.createHash('sha512').update('1234567890', 'utf-8').digest('hex').slice(0, 32);
      let iv = crypto.createHash('sha512').update('abcdef', 'utf-8').digest('hex').slice(0, 16);
      const encryptor = crypto.createCipheriv('AES-256-CBC', key, iv);
      user.password = Buffer.from(encryptor.update(password, 'utf8', 'base64') + encryptor.final('base64'))
                            .toString('base64');
      const result = await new User(user).save();
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

