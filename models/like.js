const Model = require('../model');
const User = require('./user');
const Post = require('./post');
const Comment = require('./comment');
const pool = require('../db').promise();

module.exports = class Like extends Model {
  constructor(data = {}) {
    super('likes');

    this.data.author = data.author;
    this.data.publish_date = data.publish_date;
    this.data.post = data.post;
    this.data.comment = data.comment;
    this.data.type = data.type;
  }
  static table = 'likes';

  static async get_likes(value, param) {
    const query = `SELECT \`type\`, COUNT(\`type\`) AS \`count\` FROM \`${this.table}\` WHERE \`${param}\` = ? GROUP BY \`type\``;
    try {
      if (value) {
        let result = await pool.query(query, value);
        let res = {}
        for (let i of result[0]) {
          res[i.type] = i.count + (res[i.type] ? res[i.type]:0);
        }
        return res;
      } else {
        return null;
      }
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }

  static async delete_all(obj, param) {
    try {
      if (obj && typeof obj == 'object') {
        let likes = await Like.get_likes(obj.id, param);
        await new User({id: obj.author}).change_rating(obj.topic, (likes.dislike || 0) - (likes.like || 0));
        await pool.query(`DELETE FROM \`${this.table}\` WHERE \`${param}\` = ?`, obj.id);
        return true;
      } else {
        return false;
      }
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }

  async find(value, param, author) {
    const query = `SELECT ${this.table}.* FROM \`${this.table}\` WHERE ?? = ? AND \`author\` = ? LIMIT 1`;
    try {
      if (value && author) {
        let result = await pool.query(query, [param, value, author]);
        if (result[0].length > 0) {
          Object.assign(this.data, result[0][0]);
          return result[0][0];
        } else {
          return null;
        }
      } else {
        return null;
      }
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }

  async delete() {
    const query = `DELETE FROM \`${this.table}\` WHERE \`${this.data.post ? 'post':'comment'}\` = ? AND \`author\` = ?`;
    try {
      if (this.data.author && (this.data.post || this.data.comment)
          && await this.find(this.data.post || this.data.comment, this.data.post ? 'post':'comment', this.data.author)) {
        let like_parent = this.data.post ? new Post():new Comment();
        await like_parent.find(this.data.post || this.data.comment);
        await new User({id: like_parent.data.author}).change_rating(like_parent.data.topic, this.data.type == 'like' ? -1:1);
        await pool.query(query, [this.data.post || this.data.comment, this.data.author]);
        for (let i of Object.keys(this.data)) {
          this.data[i] = undefined;
        }
        return true;
      } else {
        return false;
      }
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }

  async save() {
    try {
      if (this.data.author && (this.data.post || this.data.comment)) {
        let currLike = (await pool.query(`SELECT * FROM \`${this.table}\` WHERE \`${this.data.post ? 'post':'comment'}\` = ? AND \`author\` = ? LIMIT 1`, [this.data.post || this.data.comment, this.data.author]))[0];
        if (currLike.length > 0 && currLike[0].type != this.data.type) {
          const query = `UPDATE \`${this.table}\` SET ? WHERE \`${this.data.post ? 'post':'comment'}\` = ? AND \`author\` = ?`;
          let like_parent = this.data.post ? new Post():new Comment();
          await like_parent.find(this.data.post || this.data.comment);
          await new User({id: like_parent.data.author}).change_rating(like_parent.data.topic, this.data.type == 'like' ? 2:-2);
          await pool.query(query, [{type: this.data.type}, this.data.post || this.data.comment, this.data.author]);
          await this.find(this.data.post || this.data.comment, this.data.post ? 'post':'comment', this.data.author);
          return true;
        } else if (currLike.length == 0) {
          const data = {};
          for (let i of Object.keys(this.data)) {
            if (this.data[i])
              data[i] = this.data[i];
          }
          const query = `INSERT INTO \`${this.table}\` SET ?`;
          let like_parent = this.data.post ? new Post():new Comment();
          await like_parent.find(this.data.post || this.data.comment);
          await new User({id: like_parent.data.author}).change_rating(like_parent.data.topic, this.data.type == 'like' ? 1:-1);
          await pool.query(query, data);
          await this.find(this.data.post || this.data.comment, this.data.post ? 'post':'comment', this.data.author);
          return true;
        } else {
          return false;
        }
      } else {
        return null;
      }
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }
}

