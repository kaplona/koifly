'use strict';

var _ = require('lodash');
var sequelize = require('../orm/sequelize');
var Pilot = require('../orm/pilots');
var SendTokenToPilot = require('./helpers/send-token');
var EmailMessages = require('./helpers/email-messages');
var NormalizeError = require('../utils/error-normalize');


sequelize.sync();

/**
 * Finds a pilot by id provided in cookie,
 * sends him a token to verify his email
 * reply to client with 'success' or error if the latest occurred
 * @param {object} request
 * @param {function} reply
 */
var ResendTokenHandler = function(request, reply) {
    Pilot.findById(request.auth.credentials.userId).then((pilot) => {
        return SendTokenToPilot(pilot, EmailMessages.EMAIL_VERIFICATION, '/email');
    }).then(() => {
        reply(JSON.stringify('success'));
    }).catch((error) => {
        reply({ error: NormalizeError(error)});
    });
};


module.exports = ResendTokenHandler;
