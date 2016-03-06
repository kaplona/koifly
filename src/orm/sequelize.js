'use strict';

var Sequelize = require('sequelize');

const DATABASE = require('../secrets').database;
const USER = require('../secrets').mysqlUser;
const PASSWORD = require('../secrets').mysqlPassword;
const HOST = require('../secrets').mysqlHost;


var sequelize = new Sequelize(DATABASE, USER, PASSWORD, {
    host: HOST,
    dialect: 'mysql'
});


module.exports = sequelize;
