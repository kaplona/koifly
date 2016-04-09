'use strict';

const SCOPES = require('../constants/orm-constants').SCOPES;
var ErrorMessages = require('../errors/error-messages');
var Util = require('../utils/util');


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
        if (!Util.isEmptyString(value)) {
            var Model = require('./' + modelFileName);
            var scope = (modelFileName === 'pilots') ? SCOPES.all : SCOPES.visible;

            // assuming that 'id' is primary key
            var query = { id: { $ne: this.id } };

            if (modelFileName !== 'pilots') {
                query.pilotId = this.pilotId;
            }

            Model.scope(scope)
                .findOne({
                    where: query,
                    attributes: ['id']
                })
                .then((record) => {
                    if (record) {
                        next(msg);
                    }
                    next();
                })
                .catch((e) => {
                    next(e.message);
                });
        } else {
            next(ErrorMessages.NOT_EMPTY.replace('%field', fieldName));
        }
    };
};


module.exports = isUnique;
