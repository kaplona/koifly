'use strict';

var _ = require('lodash');
var sequelize = require('../orm/sequelize');
var Pilot = require('../orm/pilots');
var SendTokenToPilot = require('./helpers/send-token');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var NormalizeError = require('../utils/error-normalize');


sequelize.sync();


/**
 * Checks that we got email from the client,
 * finds a pilot with this email address,
 * sends him a token for one-time-login, reset password or other
 * reply to client with 'success' or error if the latest occurred
 * @param {object} emailMessage
 * @param {string} path
 * @param {object} request
 * @param {function} reply
 */
var SendTokenToEmailHandler = function(emailMessage, path, request, reply) {
    var payload = JSON.parse(request.payload);

    // Checks payload for required fields
    if (!_.isString(payload.email)) {
        reply({ error: new KoiflyError(ErrorTypes.RETRIEVING_FAILURE) });
        return;
    }

    // email is stored in lower case in DB, so as to perform case insensitivity
    Pilot.findOne({ where: { email: payload.email.toLowerCase() } }).then((pilot) => {
        if (!pilot || pilot.email !== payload.email.toLowerCase()) {
            throw new KoiflyError(ErrorTypes.NO_EXISTENT_RECORD, 'there is no pilot with this email')
        }

        return SendTokenToPilot(pilot, emailMessage, path);
    }).then(() => {
        reply(JSON.stringify('success'));
    }).catch((error) => {
        reply({ error: NormalizeError(error)});
    });
};


module.exports = SendTokenToEmailHandler;
