'use strict';

let Secrets = require('../secrets').dbApp;
if (process.env.MYSQL_ADMIN) {
    Secrets = require('../secrets').dbAdmin;
}

const DATABASE = Secrets.database;
const USER = Secrets.mysqlUser;
const PASSWORD = Secrets.mysqlPassword;
const HOST = Secrets.mysqlHost;

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
