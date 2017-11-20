'use strict';

const ErrorTypes = require('../errors/error-types');
const KoiflyError = require('../errors/error');

const SCOPES = require('../constants/orm-constants').SCOPES;

/**
 * Checks if in given model there is a record with given id.
 * @param {Object} Model – Sequelize model to query.
 * @param {number|string} recordId – Id of a record to check for.
 * @param {number|string} pilotId - Pilot id.
 * @param {string} errorMsg - Error message to reply with if record doesn't exist.
 * @param {string} [transaction] – transaction id to use for querying DB.
 * @returns {Promise} - validation function
 */
function isValidId(Model, recordId, pilotId, errorMsg, transaction) {
    if (!recordId) {
        return Promise.resolve();
    }

    const queryOptions = {
        where: {
            id: recordId,
            pilotId: pilotId
        },
        attributes: [ 'id' ]
    };
    if (transaction) {
        queryOptions.transaction = transaction;
    }

    return Model
        .scope(SCOPES.visible)
        .findOne(queryOptions)
        .then(record => {
            if (!record) {
                throw new KoiflyError(ErrorTypes.VALIDATION_ERROR, errorMsg);
            }
        });
}

module.exports = isValidId;
