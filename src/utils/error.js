'use strict';

var ErrorTypes = require('./error-types');


var defaultMessage = function(errorType) {
    switch (errorType) {
        case ErrorTypes.RETRIEVING_FAILURE:
            return 'cannot load the data';
        case ErrorTypes.NO_EXISTENT_RECORD:
            return 'there is no record with this id';
        case ErrorTypes.SAVING_FAILURE:
            return 'saving failed';
        case ErrorTypes.CONNECTION_FAILURE:
            return 'server is not responding, please, check your Internet connection';
        case ErrorTypes.VALIDATION_FAILURE:
            return 'validation failed';
        case ErrorTypes.AUTHENTICATION_FAILURE:
            return 'email or password is incorrect';
        default:
            return 'error occurred';
    }
};

var KoiflyError = function(type, message, errorList) {
    this.type = type;
    this.message = message ? message : defaultMessage(type);
    if (errorList) {
        this.errors = errorList;
    }
};
KoiflyError.prototype = Object.create(Error.prototype);
KoiflyError.prototype.constructor = KoiflyError;


module.exports = KoiflyError;
