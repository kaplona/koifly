'use strict';
/* eslint-disable no-console */
const Sequelize = require('sequelize');

let dbSecrets = require('../secrets').dbApp;
if (process.env.MYSQL_ADMIN) {
  console.log('---- init db -----');
  dbSecrets = require('../secrets').dbAdmin;
}

const DATABASE = dbSecrets.database;
const USER = dbSecrets.mysqlUser;
const PASSWORD = dbSecrets.mysqlPassword;
const HOST = dbSecrets.mysqlHost;


const db = new Sequelize(DATABASE, USER, PASSWORD, {
  host: HOST,
  dialect: 'mysql'
});


module.exports = db;
