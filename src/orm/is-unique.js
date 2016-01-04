'use strict';

var ErrorMessages = require('../utils/error-messages');


// mixed solution:
// http://stackoverflow.com/questions/16356856/sequelize-js-custom-validator-check-for-unique-username-password#answer-19306820
// https://github.com/sequelize/sequelize/issues/2640#issuecomment-97146477

/**
 * Checks if value is unique for given model and column
 * @param {string} modelFileName
 * @param {string} fieldName
 * @param {string} msg
 * @returns {Function}
 */
var isUnique = function(modelFileName, fieldName, msg) {
    return function(value, next) {
        // If value is undefined or null it should be checked by allowNull and defaultValue check
        // Here we just checks that user doesn't want to save an empty string
        if (value.trim() !== '') {
            var Model = require('./' + modelFileName);
            var scope = (modelFileName === 'pilots') ? null : 'see';
            // assuming that 'id' is primary key
            var query = { id: { $ne: this.id } };
            // emails are stored in lower case in DB
            query[fieldName] = (fieldName === 'email') ? value.toLowerCase() : value;

            Model.scope(scope).findOne({
                where: query,
                atributes: ['id']
            }).then((instance) => {
                if (instance) {
                    next(msg);
                }
                next();
            }).catch((e) => {
                next(e.message);
            });
        } else {
            next(ErrorMessages.NOT_EMPTY.replace('%field', fieldName));
        }
    };
};


module.exports = isUnique;
