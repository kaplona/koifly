'use strict';

var _ = require('lodash');
var sequelize = require('../orm/sequelize');
var BcryptPromise = require('../utils/bcrypt-promise');
var SendTokenToPilot = require('./helpers/send-token');
var EmailMessages = require('./helpers/email-messages');
var SetCookie = require('./helpers/set-cookie');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var NormalizeError = require('../utils/error-normalize');
var SanitizePilotInfo = require('./helpers/sanitize-pilot-info');
var Pilot = require('../orm/pilots');


sequelize.sync();


/**
 * Creates a new user/pilot in DB with given email and hash of given password,
 * set cookie,
 * generates random token, saves it in DB,
 * send email with verification link to new user's email,
 * replies with only pilot info since new user doesn't have any other data yet
 * @param {object} request
 * @param {function} reply
 */
var SignupHandler = function(request, reply) {
    var pilot; // we need it to have reference to current pilot
    var payload = JSON.parse(request.payload);

    // Checks payload for required fields
    if (!_.isString(payload.email) || !_.isString(payload.password)) {
        reply({ error: new KoiflyError(ErrorTypes.RETRIEVING_FAILURE) });
        return;
    }

    BcryptPromise.hash(payload.password).then((hash) => {
        var newPilot = {
            email: payload.email,
            password: hash,
            isSubscribed: payload.isSubscribed ? true : false,
            isActivated: false
        };
        return Pilot.create(newPilot);
    }).then((pilotRecord) => {
        pilot = pilotRecord;
        // Set cookie with new credentials
        return SetCookie(request, pilot.id, pilot.password);
    }).then(() => {
        // Send user email with verification token
        return SendTokenToPilot(pilot, EmailMessages.EMAIL_VERIFICATION, '/email/');
    }).then(() => {
        // Reply with pilot info since it's the only user's data yet
        reply(SanitizePilotInfo(pilot));
    }).catch((err) => {
        reply({ error: NormalizeError(err) });
    });
};


module.exports = SignupHandler;
