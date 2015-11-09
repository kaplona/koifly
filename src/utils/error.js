'use strict';


var KoiflyErrors = {};


KoiflyErrors.appError = function() {
    this.name = 'appError';
};
KoiflyErrors.appError.prototype = Object.create(Error.prototype);
KoiflyErrors.appError.prototype.constructor = KoiflyErrors.appError;


KoiflyErrors.noExistentRecord = function(message) {
    this.name = 'noExistentRecord';
    this.message = message ? message : 'there is no record with this id';
};
KoiflyErrors.noExistentRecord.prototype = Object.create(KoiflyErrors.appError.prototype);
KoiflyErrors.noExistentRecord.prototype.constructor = KoiflyErrors.noExistentRecord;


KoiflyErrors.savingFailure = function(message) {
    this.name = 'savingFailure';
    this.message = message ? message : 'saving failed';
};
KoiflyErrors.savingFailure.prototype = Object.create(KoiflyErrors.appError.prototype);
KoiflyErrors.savingFailure.prototype.constructor = KoiflyErrors.savingFailure;


KoiflyErrors.connectionFailure = function(message) {
    this.name = 'connectionFailure';
    this.message = message ? message : 'no Internet connection';
};
KoiflyErrors.connectionFailure.prototype = Object.create(KoiflyErrors.appError.prototype);
KoiflyErrors.connectionFailure.prototype.constructor = KoiflyErrors.connectionFailure;


KoiflyErrors.validationFailure = function(errors, message) {
    this.name = 'validationFailure';
    this.message = message ? message : 'validation failed';
    this.errors = errors;
};
KoiflyErrors.validationFailure.prototype = Object.create(KoiflyErrors.appError.prototype);
KoiflyErrors.validationFailure.prototype.constructor = KoiflyErrors.validationFailure;


KoiflyErrors.authenticationFailure = function(message) {
    this.name = 'authenticationFailure';
    this.message = message ? message : 'please, log in first';
};
KoiflyErrors.authenticationFailure.prototype = Object.create(KoiflyErrors.appError.prototype);
KoiflyErrors.authenticationFailure.prototype.constructor = KoiflyErrors.authenticationFailure;


module.exports = KoiflyErrors;
