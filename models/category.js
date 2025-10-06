const Model = require('../model');
const pool = require('../db').promise();

module.exports = class Category extends Model {
  constructor(data = {}) {
    super('categories');

    this.data.id = data.id;
    this.data.title = data.title;
    this.data.description = data.description;
  }
  static table = 'categories';
  
  async delete() {
    try {
      if (this.data.id && await this.find(this.data.id)) {
        await pool.query(`DELETE FROM \`topics_categories\` WHERE \`category\` = ?`, this.data.id);
        await pool.query(`DELETE FROM \`posts_categories\` WHERE \`category\` = ?`, this.data.id);
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
}

