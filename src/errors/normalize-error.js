'use strict';

var ErrorTypes = require('./error-types');
var KoiflyError = require('./error');


//Example of sequelize error:
//{
//    name: 'SequelizeValidationError',
//    message: 'notNull Violation: airtime cannot be null',
//    errors:
//    [ { message: 'airtime cannot be null',
//        type: 'notNull Violation',
//        path: 'airtime',
//        value: null } ]
//}

var normalizeError = function(error, defaultErrorType = ErrorTypes.DB_READ_ERROR, defaultMessage = null) {
    if (error instanceof KoiflyError) {
        return error;
    }

    if (error && error.output && error.output.payload.error === 'Unauthorized') {
        return new KoiflyError(ErrorTypes.AUTHENTICATION_ERROR);
    }

    if (error && error.name === 'SequelizeValidationError') {
        var validationErrors = {};
        for (var i = 0; i < error.errors.length; i++) {
            validationErrors[error.errors[i].path] = error.errors[i].message;
        }
        return new KoiflyError(ErrorTypes.VALIDATION_ERROR, error.message, validationErrors);
    }

    return new KoiflyError(defaultErrorType, defaultMessage);
};


module.exports = normalizeError;
