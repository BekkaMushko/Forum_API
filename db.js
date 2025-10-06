const mysql = require('mysql2');
const config = require('./config.json');

const connectionPool = mysql.createConnection(config);

module.exports = connectionPool;

