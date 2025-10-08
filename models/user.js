const Model = require('../model');
const Topic = require('./topic');
const pool = require('../db').promise();

module.exports = class User extends Model {
  constructor(data = {}) {
    super('users');

    this.data.id = data.id;
    this.data.login = data.login;
    this.data.password = data.password;
    this.data.full_name = data.full_name;
    this.data.email = data.email;
    this.data.email_confirmed = data.email_confirmed;
    this.data.description = data.description;
    this.data.profile_picture = data.profile_picture;
    this.data.role = data.role;
  }
  static table = 'users';

  async get_ratings() {
    const query = `SELECT * FROM \`users_ratings\` WHERE \`user\` = ?`;
    try {
      if (this.data.id && await this.find(this.data.id)) {
        let result = await pool.query(query, this.data.id);
        let res = {}
        for (let i of result[0]) {
          res[i.topic] = i.rating + (res[i.topic] ? res[i.topic]:0);
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

  async change_rating(topic, value) {
    try {
      if (this.data.id && await this.find(this.data.id)) {
        let currRating = (await this.get_ratings())[topic];
        await pool.query(`UPDATE \`users_ratings\` SET ? WHERE \`user\` = ? AND \`topic\` = ?`, [{rating: currRating + value}, this.data.id, topic]);
        return (currRating || 0) + value;
      } else {
        return null;
      }
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }

  async get_favorite(obj = {}) {
    let { limit, offset } = obj;
    const query = `SELECT posts.* FROM \`posts\` JOIN \`favorite_posts\` ON posts.id = favorite_posts.post WHERE favorite_posts.user = ?${typeof limit != 'undefined' ? ` LIMIT ?${typeof offset != 'undefined' ? ' OFFSET ?':''}`:''}`;
    const count_query = `SELECT COUNT(*) AS \`count\` FROM \`posts\` JOIN \`favorite_posts\` ON posts.id = favorite_posts.post WHERE favorite_posts.user = ?`;
    try {
      if (this.data.id && await this.find(this.data.id)) {
        let result = await pool.query(query, [this.data.id, limit, offset]);
        let count = await pool.query(count_query, this.data.id);
        return { data: result[0], count: count[0][0].count };
      } else {
        return null;
      }
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }

  async add_to_favorite(post) {
    const query = `INSERT INTO \`favorite_posts\` (\`user\`, \`post\`) VALUES (?, ?)`;
    try {
      if (this.data.id && await this.find(this.data.id)
          && (await pool.query(`SELECT * FROM \`favorite_posts\` WHERE \`user\` = ? && \`post\` = ?`, [this.data.id, post]))[0].length == 0) {
        await pool.query(query, [this.data.id, post]);
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

  async remove_from_favorite(post) {
    const query = `DELETE FROM \`favorite_posts\` WHERE \`user\` = ? AND \`post\` = ?`;
    try {
      if (this.data.id && await this.find(this.data.id)
          && (await pool.query(`SELECT * FROM \`favorite_posts\` WHERE \`user\` = ? && \`post\` = ?`, [this.data.id, post]))[0].length > 0) {
        await pool.query(query, [this.data.id, post]);
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

  async get_following_posts(obj = {}) {
    let { limit, offset } = obj;
    const query = `SELECT posts.* FROM \`posts\` JOIN \`followings_posts\` ON posts.id = followings_posts.post WHERE followings_posts.user = ?${typeof limit != 'undefined' ? ` LIMIT ?${typeof offset != 'undefined' ? ' OFFSET ?':''}`:''}`;
    const count_query = `SELECT COUNT(*) AS \`count\` FROM \`posts\` JOIN \`followings_posts\` ON posts.id = followings_posts.post WHERE followings_posts.user = ?`;
    try {
      if (this.data.id && await this.find(this.data.id)) {
        let result = await pool.query(query, [this.data.id, limit, offset]);
        let count = await pool.query(count_query, this.data.id);
        return { data: result[0], count: count[0][0].count };
      } else {
        return null;
      }
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }

  async follow_post(post) {
    const query = `INSERT INTO \`followings_posts\` (\`user\`, \`post\`) VALUES (?, ?)`;
    try {
      if (this.data.id && await this.find(this.data.id)
          && (await pool.query(`SELECT * FROM \`followings_posts\` WHERE \`user\` = ? && \`post\` = ?`, [this.data.id, post]))[0].length == 0) {
        await pool.query(query, [this.data.id, post]);
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

  async unfollow_post(post) {
    const query = `DELETE FROM \`followings_posts\` WHERE \`user\` = ? AND \`post\` = ?`;
    try {
      if (this.data.id && await this.find(this.data.id)
          && (await pool.query(`SELECT * FROM \`followings_posts\` WHERE \`user\` = ? && \`post\` = ?`, [this.data.id, post]))[0].length > 0) {
        await pool.query(query, [this.data.id, post]);
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

  async get_following_users(obj = {}) {
    let { limit, offset } = obj;
    const query = `SELECT users.* FROM \`users\` JOIN \`followings_users\` ON users.id = followings_users.user WHERE followings_users.following_user = ?${typeof limit != 'undefined' ? ` LIMIT ?${typeof offset != 'undefined' ? ' OFFSET ?':''}`:''}`;
    const count_query = `SELECT COUNT(*) AS \`count\` FROM \`users\` JOIN \`followings_users\` ON users.id = followings_users.user WHERE followings_users.following_user = ?`;
    try {
      if (this.data.id && await this.find(this.data.id)) {
        let result = await pool.query(query, [this.data.id, limit, offset]);
        let count = await pool.query(count_query, this.data.id);
        return { data: result[0], count: count[0][0].count };
      } else {
        return null;
      }
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }

  async follow_user(user) {
    const query = `INSERT INTO \`followings_users\` (\`user\`, \`following_user\`) VALUES (?, ?)`;
    try {
      if (this.data.id && await this.find(this.data.id)
          && (await pool.query(`SELECT * FROM \`followings_users\` WHERE \`user\` = ? && \`following_user\` = ?`, [user, this.data.id]))[0].length == 0) {
        await pool.query(query, [user, this.data.id]);
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

  async unfollow_user(user) {
    const query = `DELETE FROM \`followings_users\` WHERE \`user\` = ? AND \`following_user\` = ?`;
    try {
      if (this.data.id && await this.find(this.data.id)
          && (await pool.query(`SELECT * FROM \`followings_users\` WHERE \`user\` = ? && \`following_user\` = ?`, [user, this.data.id]))[0].length > 0) {
        await pool.query(query, [user, this.data.id]);
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

  async delete() {
    try {
      if (this.data.id && await this.find(this.data.id)) {
        await pool.query(`DELETE FROM \`users_ratings\` WHERE \`user\` = ?`, this.data.id);
        await pool.query(`DELETE FROM \`favorite_posts\` WHERE \`user\` = ?`, this.data.id);
        await pool.query(`DELETE FROM \`followings_posts\` WHERE \`user\` = ?`, this.data.id);
        await pool.query(`DELETE FROM \`followings_users\` WHERE \`user\` = ? OR \`following_user\` = ?`, [this.data.id, this.data.id]);
        await pool.query(`DELETE FROM \`notifications\` WHERE \`user\` = ?`, this.data.id);
        if (this.profile_picture
            && fs.existsSync(path.join(__dirname, '..', '..', 'public', 'images', this.profile_picture))) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', this.profile_picture));
        }
        return await super.delete();
      } else {
        return null;
      }
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }

  async save() {
    let initialiseTopics = false;
    try {
      if (!this.data.id
          || (await pool.query(`SELECT * FROM \`${this.table}\` WHERE \`id\` = ?`, this.data.id))[0].length == 0) {
        initialiseTopics = true;
      }
      const result = await super.save();
      if (result && initialiseTopics) {
        const topics = (await Topic.get_all()).data.map(res => res.id);
        for (let i of topics) {
          await pool.query(`INSERT INTO \`users_ratings\` (\`user\`, \`topic\`) VALUES (?, ?)`, [this.data.id, i]);
        }
      }
      return result;
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }
}

