'use strict';

const chalk = require('chalk');
const sequelize = require('./sequelize');

require('./models/flights');
require('./models/sites');
require('./models/gliders');
require('./models/pilots');


sequelize
    .sync()
    .then(() => console.log(chalk.green('db sync succeeded')))
    .catch(err => console.log(chalk.red('ERROR: db sync failed:'), err));
