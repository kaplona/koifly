'use strict';

const errorMessages = require('../../errors/error-messages');
const Util = require('../../utils/util');

/**
 * Checks if value is a date string in yyyy-mm-dd format.
 * @param {string} value
 */
function isDate(value) {
  if (typeof value !== 'string' || !Util.isRightDateFormat(value)) {
    throw new Error(errorMessages.DATE_FORMAT);
  }
}

module.exports = isDate;
