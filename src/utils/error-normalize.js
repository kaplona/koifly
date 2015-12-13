'use strict';


var KoiflyError = require('./error');
var ErrorTypes = require('./error-types');


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

var NormalizeError = function(err) {
    if (err instanceof KoiflyError) {
        return err;
    }
    if (err.name !== 'SequelizeValidationError') {
        return new KoiflyError(ErrorTypes.RETRIEVING_FAILURE);
    }

    var validationErrors = {};
    for (var i = 0; i < err.errors.length; i++) {
        validationErrors[err.errors[i].path] = err.errors[i].message;
    }
    return new KoiflyError(ErrorTypes.VALIDATION_FAILURE, null, validationErrors);
};


module.exports = NormalizeError;
