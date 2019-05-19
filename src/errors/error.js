'use strict';

const ErrorTypes = require('./error-types');


function getDefaultMessage(errorType) {
  switch (errorType) {
    case ErrorTypes.AJAX_NETWORK_ERROR:
      return 'Server is not responding, please, check your Internet connection.';
    case ErrorTypes.AUTHENTICATION_ERROR:
      return 'Email or password is incorrect.';
    case ErrorTypes.BAD_REQUEST:
      return 'Sorry, couldn\'t answer to your request.';
    case ErrorTypes.DB_READ_ERROR:
      return 'Sorry, couldn\'t load the data.';
    case ErrorTypes.DB_WRITE_ERROR:
      return 'Sorry, couldn\'t save the data, try again later.';
    case ErrorTypes.INVALID_AUTH_TOKEN:
      return 'Verification token is invalid or expired.';
    case ErrorTypes.INVALID_CSRF_TOKEN:
      return 'Invalid csrf token.';
    case ErrorTypes.FILE_IMPORT_ERROR:
      return 'Couldn\'t import your file. Please, check file format.';
    case ErrorTypes.NEED_EMAIL_VERIFICATION:
      return 'You need to verify your email before performing this operation.';
    case ErrorTypes.RECORD_NOT_FOUND:
      return 'There is no such record in the database.';
    case ErrorTypes.UNSUPPORTED_BROWSER_VERSION:
      return 'You need to upgrade your browser in order to use this feature.';
    case ErrorTypes.USER_MISMATCH:
      return 'You have logged in as a different user (probably in another tab). You need to reload this page. All unsaved data will be lost.';
    case ErrorTypes.VALIDATION_ERROR:
      return 'Validation failed.';
    default:
      return 'Error occurred.';
  }
}

const KoiflyError = function (type, message, errorList) {
  this.type = type;
  this.message = message ? message : getDefaultMessage(type);
  if (errorList) {
    this.errors = errorList;
  }
};
KoiflyError.prototype = Object.create(Error.prototype);
KoiflyError.prototype.constructor = KoiflyError;


module.exports = KoiflyError;
