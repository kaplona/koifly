'use strict';

var Sequelize = require('sequelize');

var Secrets = require('../secrets').dbApp;

console.log('---- init db -----');
if (process.env.MYSQL_ADMIN) {
    console.log('---- admin db -----');
    Secrets = require('../secrets').dbAdmin;
}

const DATABASE = Secrets.database;
const USER = Secrets.mysqlUser;
const PASSWORD = Secrets.mysqlPassword;
const HOST = Secrets.mysqlHost;


var sequelize = new Sequelize(DATABASE, USER, PASSWORD, {
    host: HOST,
    dialect: 'mysql'
});


module.exports = sequelize;
