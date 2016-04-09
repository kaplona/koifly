'use strict';

var sequelize = require('./sequelize');

require('./flights');
require('./sites');
require('./gliders');
require('./pilots');


sequelize.sync();
