'use strict';
/* eslint-disable no-console */
const chalk = require('chalk');
const db = require('./sequelize-db');

require('./models/flights');
require('./models/sites');
require('./models/gliders');
require('./models/pilots');


db
  .sync()
  .then(() => console.log(chalk.green('db sync succeeded')))
  .catch(err => console.log(chalk.red('ERROR: db sync failed:'), err));
