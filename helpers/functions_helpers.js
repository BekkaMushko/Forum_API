const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

const tokenKey = '1a2b-3c4d-5e6f-7g8h';
const transporter = nodemailer.createTransport({
  host: 'smtp.ukr.net',
  port: 465,
  secure: true,
  auth: {
    user: 'polinarezchik@ukr.net',
    pass: '4J24DlQm6ymhRirw'
  }
});

module.exports = class FunctionsHelpers {
  static create_token(obj, type) {
    return jwt.sign({ id: obj.id },
                    tokenKey,
                    { expiresIn: type == 'user'
                                         ? '30d'
                                         : type == 'password' || type == 'email' ? '30m':''});
  }

  static async auth_check(req, res, next) {
    try {
      if (req.headers.authorization) {
        let payload = jwt.verify(req.headers.authorization.split(' ')[1], tokenKey);
        if (payload) {
          const user = await new User().find(payload.id);
          if (!user) {
            return res.status(404).json({
              status: false,
              error: 'Current user is not found'
            });
          } else if (!user.email_confirmed) {
            return res.status(401).json({
              status: false,
              error: 'Email is not confirmed'
            });
          }
          req.user = user;
          next();
        } else {
          return res.status(401).json({
            status: false,
            error: 'Invalid token'
          });
        }
      } else {
        return res.status(401).json({
          status: false,
          error: 'Unauthorized'
        });
      }
    } catch(err) {
      if (err.name == 'TokenExpiredError') {
        return res.status(401).json({
          status: false,
          error: 'Invalid token'
        });
      } else {
        console.error(err);
        return res.status(500).json({
          status: false,
          error: err
        });
      }
    }
  }

  static user_from_email(token) {
    try {
      if (token) {
        let payload = jwt.verify(token, tokenKey);
        if (payload) {
          return { status: true, user: payload };
        } else {
          return {
            status: false,
            error: 'Invalid token'
          };
        }
      } else {
        return {
          status: false,
          error: 'Unauthorized'
        };
      }
    } catch(err) {
      if (err.name == 'TokenExpiredError') {
        return {
          status: false,
          error: 'Invalid token'
        };
      } else {
        console.error(err);
        return {
          status: false,
          error: err
        };
      }
    }
  }

  static access_check(roles) {
    return async (req, res, next) => {
      const publication = req.params.post_id
                          ? await new Post().find(req.params.post_id)
                          : req.params.comment_id
                            ? await new Comment().find(req.params.comment_id)
                            : null;
      const author = publication ? publication.author:null;
      if (!req.user
          || !(roles.includes(req.user.role)
          || (roles.includes('author') && req.user.id == author)
          || (roles.includes('me') && req.user.id == req.params.user_id))) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden'
        });
      } else {
        next();
      }
    }
  }

  static async send_email(login, email, type, token) {
    try {
      await transporter.sendMail({
        from: '"prezchyk" <polinarezchik@ukr.net>',
        to: email,
        subject: type == 'password' ? 'Password reset':'Email confirmation',
        html: `<h3>Hello ${login}!</h3><p>Here's your link to ${type == 'password' ? 'reset password':'confirm email'}: <strong>http://localhost:3000/api/auth/${type == 'password' ? 'password-reset':'email-confirmation'}/${token}</strong></p><p>This link is valid for 30 minutes.</p>`
      });
      return true;
    } catch(err) {
      console.error(err);
      return false;
    }
  }
}

