'use strict';

const ErrorTypes = require('../../errors/error-types');
const KoiflyError = require('../../errors/error');
const SCOPES = require('../../constants/orm-constants').SCOPES;
const Util = require('../../utils/util');

/**
 * Checks if in given model there is a record with given id.
 * Note: it assume that `id` is a primary key for given Model
 * @param {Object} Model – Sequelize model to query.
 * @param {number|string} recordId – Id of a record to check for.
 * @param {number|string} pilotId - Pilot id.
 * @param {string} errorMsg - Error message to reply with if record doesn't exist.
 * @param {string} [transaction] – Transaction id to use for querying DB.
 * @returns {Promise} - Resolved Promise if id exists, rejected Promise if it doesn't or DB read error occurred.
 */
function isValidId(Model, recordId, pilotId, errorMsg, transaction) {
  // If value is empty it should be checked by other validation rules.
  if (Util.isEmptyString(recordId)) {
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
        return Promise.reject(new KoiflyError(ErrorTypes.VALIDATION_ERROR, errorMsg));
      }
    });
}

module.exports = isValidId;
