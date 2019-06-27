'use strict';

import errorMessages from '../../errors/error-messages';
import errorTypes from '../../errors/error-types';
import KoiflyError from '../../errors/error';
import Sequelize from 'sequelize';
import ormConstants from '../../constants/orm-constants';
import Util from '../../utils/util';

/**
 * Checks if value is unique for given model and column.
 * Note: it assume that `id` is a primary key for given Model.
 * @param {Object} Model – Sequelize model to query.
 * @param {Object} record – New record to be saved.
 * @param {string} fieldName – Field name which should be unique.
 * @param {string} errorMsg - Error message to reply with if record isn't unique.
 * @param {string} [transaction] – Transaction id to use for querying DB.
 * @param {Boolean} scopeAll – Whether to query all records. By default query will be scoped to visible records (which
 * weren't deleted).
 * @returns {Promise} - Resolved Promise if value is unique, rejected Promise if it isn't or DB read error occurred.
 */
export default function isUnique(Model, record, fieldName, errorMsg, transaction, scopeAll = false) {
  const fieldValue = record[fieldName];

  // Unique value can't be empty.
  if (Util.isEmptyString(fieldValue)) {
    const error = new KoiflyError(errorTypes.VALIDATION_ERROR, errorMessages.NOT_EMPTY.replace('%field', fieldName));
    return Promise.reject(error);
  }

  const scope = scopeAll ? ormConstants.SCOPES.all : ormConstants.SCOPES.visible;
  const queryOptions = {
    where: {
      id: { [Sequelize.Op.ne]: record.id },
      [fieldName]: fieldValue
    },
    attributes: [ 'id' ]
  };
  if (transaction) {
    queryOptions.transaction = transaction;
  }
  if (record.pilotId) {
    queryOptions.where.pilotId = record.pilotId;
  }

  return Model
    .scope(scope)
    .findOne(queryOptions)
    .then(existingRecord => {
      if (existingRecord) {
        const errorList = {
          [fieldName]: errorMsg
        };
        return Promise.reject(new KoiflyError(errorTypes.VALIDATION_ERROR, errorMsg, errorList));
      }
    });
}
