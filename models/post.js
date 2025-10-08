const Model = require('../model');
const Notification = require('./notification');
const pool = require('../db').promise();

module.exports = class Post extends Model {
  constructor(data = {}) {
    super('posts');

    this.data.id = data.id;
    this.data.author = data.author;
    this.data.title = data.title;
    this.data.publish_date = data.publish_date;
    this.data.type = data.type;
    this.data.status = data.status;
    this.data.content = data.content;
    this.data.image = data.image;
    this.data.topic = data.topic;
    this.data.categories = data.categories ? JSON.parse(JSON.stringify(data.categories)):[];
  }
  static table = 'posts';

  static async search_by_title(search_str, limit, offset) {
    let words = search_str.split(' ').filter((word) => { return word != '' });
    let words_query = '';
    for (let i of words) {
      words_query += (words_query != '' ? ' AND ':'') + `\`title\` LIKE "%${i}%"`;
    }
    const query = `SELECT ${this.table}.* FROM ${this.table} LEFT JOIN (SELECT \`post\`, CASE WHEN \`type\` = 'like' THEN \`count\` ELSE 0 END AS \`likes\`, CASE WHEN \`type\` = 'dislike' THEN \`count\` ELSE 0 END AS \`dislikes\` FROM (SELECT \`post\`, \`type\`, COUNT(\`type\`) AS \`count\` FROM (SELECT likes.type AS \`type\`, posts.id AS \`post\` FROM \`likes\` RIGHT JOIN \`posts\` ON likes.post = posts.id) AS \`likes\` GROUP BY \`post\`, \`type\`) AS \`counts\`) AS \`ratings\` ON posts.id = ratings.post WHERE ${words_query} ORDER BY ratings.likes - ratings.dislikes${typeof limit != 'undefined' ? ` LIMIT ?${typeof offset != 'undefined' ? ' OFFSET ?':''}`:''}`;
    const count_query = `SELECT COUNT(*) AS \`count\` FROM ${this.table} LEFT JOIN (SELECT \`post\`, CASE WHEN \`type\` = 'like' THEN \`count\` ELSE 0 END AS \`likes\`, CASE WHEN \`type\` = 'dislike' THEN \`count\` ELSE 0 END AS \`dislikes\` FROM (SELECT \`post\`, \`type\`, COUNT(\`type\`) AS \`count\` FROM (SELECT likes.type AS \`type\`, posts.id AS \`post\` FROM \`likes\` RIGHT JOIN \`posts\` ON likes.post = posts.id) AS \`likes\` GROUP BY \`post\`, \`type\`) AS \`counts\`) AS \`ratings\` ON posts.id = ratings.post WHERE ${words_query} ORDER BY ratings.likes - ratings.dislikes`;
    let values_array = [];
    if (typeof limit != 'undefined') {
      values_array.push(limit);
    }
    if (typeof offset != 'undefined') {
      values_array.push(offset);
    }
    try {
      let result = await pool.query(query, values_array);
      let count = await pool.query(count_query);
      return { data: result[0], count: count[0][0].count };
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }

  async get_categories() {
    const query = `SELECT categories.* FROM \`categories\` JOIN \`posts_categories\` ON posts_categories.category = categories.id WHERE posts_categories.post = ?`;
    try {
      if (this.data.id && await super.find(this.data.id)) {
        let result = await pool.query(query, this.data.id);
        return result[0];
      } else {
        return null;
      }
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }

  async find(value, param) {
    try {
      if (value && await super.find(value, param)) {
        this.data.categories = await this.get_categories();
        return JSON.parse(JSON.stringify(this.data));
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
    try {
      if (this.data.id && await this.find(this.data.id)) {
        await pool.query(`DELETE FROM \`posts_categories\` WHERE \`post\` = ?`, this.data.id);
        await pool.query(`DELETE FROM \`favorite_posts\` WHERE \`post\` = ?`, this.data.id);
        await pool.query(`DELETE FROM \`followings_posts\` WHERE \`post\` = ?`, this.data.id);
        await pool.query(`DELETE FROM \`notifications\` WHERE \`notification_post\` = ?`, this.data.id);
        if (this.image
            && fs.existsSync(path.join(__dirname, '..', '..', 'public', 'images', this.image))) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', this.image));
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
    let newNotifications = false;
    let newCategories = this.data.categories.length > 0 && isNaN(this.data.categories[0])
                        ? this.data.categories.map(res => res.id)
                        : this.data.categories;
    let currData = JSON.parse(JSON.stringify(this.data));
    try {
      if (this.data.id
          && (await pool.query(`SELECT * FROM \`${this.table}\` WHERE \`id\` = ?`, this.data.id))[0].length == 1) {
        let currCategories = (await this.get_categories()).map(res => res.id);
        for (let i of currCategories) {
          let elIdx = newCategories.indexOf(i);
          if (elIdx >= 0) {
            newCategories.splice(elIdx, 1);
          } else {
            await pool.query(`DELETE FROM \`posts_categories\` WHERE \`post\` = ? AND \`category\` = ?`, [this.data.id, i]);
          }
        }
      } else {
        newNotifications = true;
      }
      Object.assign(this.data, currData);
      delete this.data.categories;
      let result = await super.save();
      if (result) {
        for (let i of newCategories) {
          await pool.query(`INSERT INTO \`posts_categories\` (\`post\`, \`category\`) VALUES (?, ?)`, [result.id, i]);
        }
        if (newNotifications) {
          const followers = (await pool.query(`SELECT * FROM \`followings_users\` WHERE \`user\` = ?`, this.data.author))[0]
                             .map(res => res.following_user);
          for (let i of followers) {
            await new Notification({
                                      user: i,
                                      type: 'following_publication',
                                      notification_post: this.data.id
                                   }).save();
          }
        }
        this.data.categories = await this.get_categories();
      }
      return result;
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }
}

