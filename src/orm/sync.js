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

// You can use this script for synchronizing tables' and models' indexes, but better create a proper migration for it.
// For database initialization and consequent updates run migration script: "npm run db_migrate"
db
  .sync()
  .then(() => console.log(chalk.green('db sync succeeded')))
  .catch(err => console.log(chalk.red('ERROR: db sync failed:'), err));
