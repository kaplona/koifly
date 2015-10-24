'use strict';

var Sequelize = require('sequelize');
var Constants = require('../utils/constants');
var DataBase = Constants.database;
var User = Constants.mysqlUser;
var Password = Constants.mysqlPassword;
var Host = Constants.mysqlHost;


var sequelize = new Sequelize(DataBase, User, Password, {
    host: Host,
    dialect: 'mysql'
});


module.exports = sequelize;
