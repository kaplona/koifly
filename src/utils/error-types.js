'use strict';


var ErrorTypes = {
    AUTHENTICATION_FAILURE: 'authenticationFailure',
    CONNECTION_FAILURE: 'connectionFailure',
    INVALID_CSRF_TOKEN: 'invalidCsrfToken',
    INVALID_TOKEN: 'invalidToken',
    NO_EXISTENT_RECORD: 'noExistentRecord',
    NOT_ACTIVATED_USER: 'notActivatedUser',
    RETRIEVING_FAILURE: 'retrievingFailure',
    SAVING_FAILURE: 'savingFailure',
    VALIDATION_FAILURE: 'validationFailure'
};


module.exports = ErrorTypes;
