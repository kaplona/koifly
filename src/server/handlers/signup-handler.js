'use strict';

var _ = require('lodash');

var BcryptPromise = require('../../utils/bcrypt-promise');
var MessageTemplates = require('../constants/messages-templates');
var ErrorTypes = require('../../errors/error-types');
var KoiflyError = require('../../errors/error');
var normalizeError = require('../../errors/normalize-error');
var Pilot = require('../../orm/pilots');
var getPilotValuesForFrontend = require('./../helpers/get-pilot-values');
var sendAuthTokenToPilot = require('../helpers/send-auth-token');
var setAuthCookie = require('../helpers/set-auth-cookie');



/**
 * Creates a new user/pilot in DB with given email and hash of given password,
 * set cookie,
 * generates random token, saves it in DB,
 * send email with verification link to new user's email,
 * replies with only pilot info since new user doesn't have any other data yet
 * @param {object} request
 * @param {function} reply
 */
var signupHandler = function(request, reply) {
    var pilot; // we need it to have reference to current pilot
    var payload = JSON.parse(request.payload);

    // Checks payload for required fields
    if (!_.isString(payload.email) || !_.isString(payload.password)) {
        reply({ error: new KoiflyError(ErrorTypes.BAD_REQUEST) });
        return;
    }

    BcryptPromise
        .hash(payload.password)
        .then((hash) => {
            var newPilot = {
                email: payload.email,
                password: hash,
                isSubscribed: payload.isSubscribed ? true : false,
                isActivated: false
            };
            return Pilot.create(newPilot);
        })
        .then((pilotRecord) => {
            pilot = pilotRecord;
            // Set cookie with new credentials
            return setAuthCookie(request, pilot.id, pilot.password);
        })
        .then(() => {
            // Send user email with auth verification token
            return sendAuthTokenToPilot(pilot, MessageTemplates.EMAIL_VERIFICATION, '/email/');
        })
        .then(() => {
            // Reply with pilot info since it's the only user's data yet
            reply(getPilotValuesForFrontend(pilot));
        })
        .catch((err) => {
            reply({ error: normalizeError(err) });
        });
};


module.exports = signupHandler;
