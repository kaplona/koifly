'use strict';

const ErrorMessages = require('../errors/error-messages');
const Util = require('../utils/util');

/**
 * Checks if value is a date string in yyyy-mm-dd format.
 * @param {string} value
 */
function isDate(value) {
    console.log('-------> is date validation <-------');
    if (typeof value !== 'string' || !Util.isRightDateFormat(value)) {
        console.log('throw');
        throw new Error(ErrorMessages.DATE_FORMAT);
    }
}

module.exports = isDate;
