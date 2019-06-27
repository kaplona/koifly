'use strict';
// config to be used by sequelize-cli
let dbSecrets = require('../secrets').dbApp;
if (process.env.MYSQL_ADMIN) {
  dbSecrets = require('../secrets').dbAdmin;
}

const DATABASE = dbSecrets.database;
const USER = dbSecrets.mysqlUser;
const PASSWORD = dbSecrets.mysqlPassword;
const HOST = dbSecrets.mysqlHost;

module.exports = {
  development: {
    username: USER,
    password: PASSWORD,
    database: DATABASE,
    host: HOST,
    dialect: 'mysql'
    // By default the CLI will not save any seed that is executed, but it can be useful for testing
    // seederStorage: 'sequelize'
  },
  production: {
    username: USER,
    password: PASSWORD,
    database: DATABASE,
    host: HOST,
    dialect: 'mysql'
  }
};
