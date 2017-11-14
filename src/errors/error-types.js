'use strict';


var ErrorTypes = {
    AJAX_NETWORK_ERROR: 'ajaxNetworkError',
    AUTHENTICATION_ERROR: 'authenticationError',
    BAD_REQUEST: 'badRequest',
    DB_READ_ERROR: 'DBReadError',
    DB_WRITE_ERROR: 'DBWriteError',
    INVALID_AUTH_TOKEN: 'invalidAuthToken',
    INVALID_CSRF_TOKEN: 'invalidCsrfToken',
    NEED_EMAIL_VERIFICATION: 'needEmailVerification',
    RECORD_NOT_FOUND: 'recordNotFound',
    UNSUPPORTED_BROWSER_VERSION: 'unsupportedBrowserVersion',
    USER_MISMATCH: 'userMismatch',
    VALIDATION_ERROR: 'validationError'
};


module.exports = ErrorTypes;
