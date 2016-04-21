'use strict';

const SCOPES = require('../constants/orm-constants').SCOPES;


// mixed solution:
// http://stackoverflow.com/questions/16356856/sequelize-js-custom-validator-check-for-unique-username-password#answer-19306820
// https://github.com/sequelize/sequelize/issues/2640#issuecomment-97146477

/**
 * Checks if in given model there is a record with id = value
 * @param {string} modelFileName
 * @param {string} msg - error message to reply with if record already exists
 * @returns {Function} - validation function
 */
var isValidId = function(modelFileName, msg) {
    return function(value, next) {
        var Model = require('./' + modelFileName);

        Model.scope(SCOPES.visible)
            .findById(value)
            .then(record => {
                if (record) {
                    next();
                }
                next(msg);
            })
            .catch(error => {
                next(error.message);
            });
    };
};

module.exports = isValidId;
