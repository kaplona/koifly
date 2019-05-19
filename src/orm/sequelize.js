'use strict';
/* eslint-disable no-console */
const Sequelize = require('sequelize');

let Secrets = require('../secrets').dbApp;
if (process.env.MYSQL_ADMIN) {
  console.log('---- init db -----');
  Secrets = require('../secrets').dbAdmin;
}

const DATABASE = Secrets.database;
const USER = Secrets.mysqlUser;
const PASSWORD = Secrets.mysqlPassword;
const HOST = Secrets.mysqlHost;


const sequelize = new Sequelize(DATABASE, USER, PASSWORD, {
  host: HOST,
  dialect: 'mysql'
});


module.exports = sequelize;
