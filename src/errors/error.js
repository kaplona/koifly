'use strict';

var ErrorTypes = require('./error-types');


var getDefaultMessage = function(errorType) {
    switch (errorType) {
        case ErrorTypes.AJAX_NETWORK_ERROR:
            return 'server is not responding, please, check your Internet connection';
        case ErrorTypes.AUTHENTICATION_ERROR:
            return 'email or password is incorrect';
        case ErrorTypes.BAD_REQUEST:
            return 'sorry, couldn\'t answer to your request';
        case ErrorTypes.DB_READ_ERROR:
            return 'sorry, couldn\'t load the data';
        case ErrorTypes.DB_WRITE_ERROR:
            return 'sorry, couldn\'t save the data, try again later';
        case ErrorTypes.INVALID_AUTH_TOKEN:
            return 'verification token is invalid or expired';
        case ErrorTypes.INVALID_CSRF_TOKEN:
            return 'invalid csrf token';
        case ErrorTypes.NEED_EMAIL_VERIFICATION:
            return 'You need to verify your email before performing this operation.';
        case ErrorTypes.RECORD_NOT_FOUND:
            return 'there is no such record in the database';
        case ErrorTypes.VALIDATION_ERROR:
            return 'validation failed';
        default:
            return 'error occurred';
    }
};

var KoiflyError = function(type, message, errorList) {
    this.type = type;
    this.message = message ? message : getDefaultMessage(type);
    if (errorList) {
        this.errors = errorList;
    }
};
KoiflyError.prototype = Object.create(Error.prototype);
KoiflyError.prototype.constructor = KoiflyError;


module.exports = KoiflyError;
