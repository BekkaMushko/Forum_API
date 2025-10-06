const pool = require('./db').promise();

module.exports = class Model {
  constructor(table) {
    this.table = table;
    this.data = {};
  }

  static async get_all(obj = {}) {
    let { value, param, order_by, asc, limit, offset } = obj;
    if (!order_by && (this.table == 'posts' || this.table == 'comments')) {
      order_by = 'rating';
    }
    let join_table = '';
    let where = '';
    let group_by_having = '';
    if (order_by == 'rating') {
      let join_table_name = this.table.slice(0, this.table.length - 1);
      join_table = `(SELECT \`${join_table_name}\`, MAX(\`likes\`) AS \`likes\`, MAX(\`dislikes\`) AS \`dislikes\` FROM (SELECT \`${join_table_name}\`, CASE WHEN \`type\` = 'like' THEN \`count\` ELSE 0 END AS \`likes\`, CASE WHEN \`type\` = 'dislike' THEN \`count\` ELSE 0 END AS \`dislikes\` FROM (SELECT \`${join_table_name}\`, \`type\`, COUNT(\`type\`) AS \`count\` FROM (SELECT likes.type AS \`type\`, ${join_table_name}s.id AS \`${join_table_name}\` FROM \`likes\` RIGHT JOIN \`${join_table_name}s\` ON likes.${join_table_name} = ${join_table_name}s.id) AS \`likes\` GROUP BY \`${join_table_name}\`, \`type\`) AS \`counts\`) AS \`ratings_separated\` GROUP BY \`${join_table_name}\`) AS \`ratings\` ON ${join_table_name}s.id = ratings.${join_table_name}`;
    }
    if (typeof param == 'string' || (typeof param == 'undefined' && value)) {
      param = [param];
      value = value instanceof Array ? value:[value];
    }
    if (param && param.includes('categories')) {
      if (join_table != '') {
        join_table += ' LEFT JOIN ';
      }
      join_table += '\`posts_categories\` ON posts_categories.post = posts.id';
      group_by_having = ` GROUP BY posts.id${order_by == 'rating' ? ', ratings.likes, ratings.dislikes':''} HAVING COUNT(DISTINCT posts_categories.category) = ${value[param.indexOf('categories')].length}`;
      param[param.indexOf('categories')] = 'posts_categories.category';
    }
    for (let i = 0; param && i < param.length; ++i) {
      if (typeof value[i] != 'undefined') {
        where += where != '' ? ' AND ':' WHERE ';
        where += `${param[i] ? '??':'\`id\`'} ${value[i] instanceof Array ? (param[i] == 'publish_date' ? 'BETWEEN ? AND ?':'IN (?)'):`${value[i] === null ? 'IS NULL':'= ?'}`}${param[i] == 'post' && this.table == 'comments' ? ' AND \`parent_comment\` IS NULL':''}`;
      }
    }
    const query = `SELECT ${this.table}.* FROM \`${this.table}\`${join_table ? ` LEFT JOIN ${join_table}`:''}${typeof value != 'undefined' ? where:''}${group_by_having}${order_by ? ` ORDER BY ${this.table == 'comments' ? '\`answer\` DESC, ':''}${order_by == 'rating' ? 'ratings.likes - ratings.dislikes':'??'} ${asc ? 'ASC':'DESC'}, \`id\` ${order_by == 'publish_date' || order_by == 'rating' || order_by == 'id' ? `${asc ? 'ASC':'DESC'}`:`DESC`}`:''}${typeof limit != 'undefined' ? ` LIMIT ?${typeof offset != 'undefined' ? ' OFFSET ?':''}`:''}`;
    let values_array = [];
    for (let i = 0; param && i < param.length; ++i) {
      if (param[i]) {
        values_array.push(param[i]);
      }
      if (param[i] == 'publish_date') {
        values_array = values_array.concat(value[i]);
      } else if (typeof value[i] != 'undefined') {
        values_array.push(value[i]);
      }
    }
    if (order_by && order_by != 'rating') {
      values_array.push(order_by);
    }
    if (typeof limit != 'undefined') {
      values_array.push(limit);
    }
    if (typeof offset != 'undefined') {
      values_array.push(offset);
    }
    try {
      let result = await pool.query(query, values_array);
      return result[0];
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }

  async find(value, param) {
    const query = `SELECT * FROM \`${this.table}\` WHERE ?? = ? LIMIT 1`;
    try {
      if (value) {
        let result = await pool.query(query, [param || 'id', value]);
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
    const query = `DELETE FROM \`${this.table}\` WHERE \`id\` = ?`;
    try {
      if (this.data.id && await this.find(this.data.id)) {
        await pool.query(query, this.data.id);
        let id = this.data.id;
        for (let i of Object.keys(this.data)) {
          this.data[i] = undefined;
        }
        return id;
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
    try {
      if (this.data.id
          && (await pool.query(`SELECT * FROM \`${this.table}\` WHERE \`id\` = ?`, this.data.id))[0].length == 1) {
        const data = {};
        for (let i of Object.keys(this.data)) {
          if ((this.data[i] || typeof this.data[i] == 'number' || typeof this.data[i] == 'boolean' || this.data[i] === null)
              && i != 'id' && i != 'publish_date' && i != 'create_date')
            data[i] = this.data[i];
        }
        const query = `UPDATE \`${this.table}\` SET ? WHERE \`id\` = ?`;
        await pool.query(query, [data, this.data.id]);
        await this.find(this.data.id);
      } else {
        const data = {};
        for (let i of Object.keys(this.data)) {
          if (this.data[i] && i != 'id')
            data[i] = this.data[i];
        }
        const query = `INSERT INTO \`${this.table}\` SET ?`;
        let result = await pool.query(query, data);
        await this.find(result[0].insertId);
      }
      return this.data;
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }
}

