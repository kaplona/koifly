'use strict';

// Perform babel transforms defined in .babelrc (ES6, JSX, etc.) on server-side code
// Note: the options in .babelrc are also used for client-side code
// because we use a babel-loader in webpack config
require('@babel/register');

/* eslint-disable no-console */
const chalk = require('chalk');
const db = require('./sequelize-db').default;

require('./models/pilots');
require('./models/sites');
require('./models/gliders');
require('./models/flights');


// Inits your Data Base. Creates tables for new Sequelize models if they don't exist and synchronise indexes.
// With "force" flag will drop all tables and replace them with new ones.
// Use this script for initial run of your application: "npm run db_init"
// For consequent runs use migration scripts: "npm run db_migrate"
// You still can sync your tables after running migration scripts in order to sync table indexes.
db
  .sync()
  .then(() => console.log(chalk.green('db sync succeeded')))
  .catch(err => console.log(chalk.red('ERROR: db sync failed:'), err));
