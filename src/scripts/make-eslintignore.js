'use strict';

const path = require('path');
const FileWriter = require('../tools/file-writer');
const config = require('../config/variables');


const eslintIgnore = [
    '###',
    '### WARNING: This file is generated by ' + path.basename(__filename) + ' - do not edit manually!',
    '###',
    '',
    path.relative(config.paths.root, config.paths.build),
    ''
];


module.exports = function() {
    FileWriter.write('.eslintignore', eslintIgnore.join('\n'));
};
