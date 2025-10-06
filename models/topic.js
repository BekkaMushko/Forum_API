const Model = require('../model');
const Post = require('./post');
const pool = require('../db').promise();

module.exports = class Topic extends Model {
  constructor(data = {}) {
    super('topics');

    this.data.id = data.id;
    this.data.title = data.title;
    this.data.description = data.description;
  }
  static table = 'topics';

  async get_categories() {
    const query = `SELECT categories.* FROM \`categories\` JOIN \`topics_categories\` ON topics_categories.category = categories.id WHERE topics_categories.topic = ?`;
    try {
      if (this.data.id && await this.find(this.data.id)) {
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

  async is_category_connected(category) {
    const query = `SELECT * FROM \`topics_categories\` WHERE \`category\` = ? AND \`topic\` = ?`;
    try {
      return this.data.id && await this.find(this.data.id)
             && (await pool.query(query, [category, this.data.id]))[0].length > 0
             ? true
             : false;
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }

  async connect_category(category) {
    const query = `INSERT INTO \`topics_categories\` (\`category\`, \`topic\`) VALUES (?, ?)`;
    try {
      if (this.data.id && await this.find(this.data.id) && !(await this.is_category_connected(category))) {
        await pool.query(query, [category, this.data.id]);
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

  async disconnect_category(category) {
    const query = `DELETE FROM \`topics_categories\` WHERE \`category\` = ? AND \`topic\` = ?`;
    try {
      if (this.data.id && await this.find(this.data.id) && (await this.is_category_connected(category))) {
        await pool.query('DELETE FROM \`posts_categories\` WHERE \`category\` = ? AND \`post\` IN (SELECT \`id\` FROM \`posts\` WHERE \`topic\` = ?)', [category, this.data.id]);
        await pool.query(query, [category, this.data.id]);
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
        await pool.query(`DELETE FROM \`topics_categories\` WHERE \`topic\` = ?`, this.data.id);
        await pool.query(`DELETE FROM \`users_ratings\` WHERE \`topic\` = ?`, this.data.id);
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
    let initialiseRatings = false;
    try {
      if (!this.data.id
          || (await pool.query(`SELECT * FROM \`${this.table}\` WHERE \`id\` = ?`, this.data.id))[0].length == 0) {
        initialiseRatings = true;
      }
      const result = await super.save();
      if (result && initialiseRatings) {
        const users = (await pool.query('SELECT * FROM \`users\`', this.data.id))[0].map(res => res.id);
        for (let i of users) {
          await pool.query(`INSERT INTO \`users_ratings\` (\`user\`, \`topic\`) VALUES (?, ?)`, [i, this.data.id]);
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

