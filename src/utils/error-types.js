'use strict';


var ErrorTypes = {
    RETRIEVING_FAILURE: 'retrievingFailure',
    NO_EXISTENT_RECORD: 'noExistentRecord',
    SAVING_FAILURE: 'savingFailure',
    CONNECTION_FAILURE: 'connectionFailure',
    VALIDATION_FAILURE: 'validationFailure',
    AUTHENTICATION_FAILURE: 'authenticationFailure',
    INVALID_TOKEN: 'invalidToken'
};


module.exports = ErrorTypes;
