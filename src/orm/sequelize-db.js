'use strict';
/* eslint-disable no-console */
import chalk from 'chalk';
import Sequelize from 'sequelize';
import Secrets from '../secrets';

let dbSecrets = Secrets.dbApp;
if (process.env.MYSQL_ADMIN) {
  console.log(chalk.green('---- init db -----'));
  dbSecrets = Secrets.dbAdmin;
}

const DATABASE = dbSecrets.database;
const USER = dbSecrets.mysqlUser;
const PASSWORD = dbSecrets.mysqlPassword;
const HOST = dbSecrets.mysqlHost;


const db = new Sequelize(DATABASE, USER, PASSWORD, {
  host: HOST,
  dialect: 'mysql'
});


export default db;
