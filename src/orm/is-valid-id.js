'use strict';


// mixed solution:
// http://stackoverflow.com/questions/16356856/sequelize-js-custom-validator-check-for-unique-username-password#answer-19306820
// https://github.com/sequelize/sequelize/issues/2640#issuecomment-97146477

/**
 * Checks if in given model there is a record with id = value
 * @param {string} modelFileName
 * @param {string} msg - error message to reply with if record already exists
 * @returns {Function}
 */
var isValidId = function(modelFileName, msg) {
    return function(value, next) {
        if (value) {
            var Model = require('./' + modelFileName);
            Model.scope('see').findById(value).then((instance) => {
                if (instance) {
                    next();
                }
                next(msg);
            }).catch((e) => {
                next(e.message);
            });
        } else {
            next('empty field');
        }
    }
};

module.exports = isValidId;
