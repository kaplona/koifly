'use strict';


// mixed solution:
// http://stackoverflow.com/questions/16356856/sequelize-js-custom-validator-check-for-unique-username-password#answer-19306820
// https://github.com/sequelize/sequelize/issues/2640#issuecomment-97146477

/**
 * Checks if value is unique for given model and column
 * @param {string} modelFileName
 * @param {string} fieldName
 * @returns {Function}
 */
var isUnique = function(modelFileName, fieldName) {
    return function(value, next) {
        if (value) {
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
                    next('this ' + fieldName + ' already exists');
                }
                next();
            }).catch((e) => {
                next(e.message);
            });
        } else {
            next(fieldName + ' cannot be empty');
        }
    };
};


module.exports = isUnique;
