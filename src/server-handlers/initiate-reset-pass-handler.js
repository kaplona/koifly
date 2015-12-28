'use strict';

var SendToken = require('./helpers/send-token');
var EmailMessages = require('./helpers/email-messages');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');


var InitiateResetPassHandler = function(request, reply) {
    // Checks query for required fields
    if (!request.query.email || !(JSON.parse(request.query.email) instanceof String)) {
        reply({ error: new KoiflyError(ErrorTypes.RETRIEVING_FAILURE) });
        return;
    }
    // email is stored in lower case in DB, so as to perform case insensitivity
    var userCredentials = { email: JSON.parse(request.query.email).toLowerCase() };
    SendToken(reply, userCredentials, EmailMessages.PASSWORD_RESET, '/reset-pass');
};


module.exports = InitiateResetPassHandler;
