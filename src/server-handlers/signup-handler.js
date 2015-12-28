'use strict';

var sequelize = require('../orm/sequelize');
var BcryptPromise = require('../utils/bcrypt-promise');
var GenerateToken = require('./helpers/generate-token');
var SendMail = require('./helpers/send-mail');
var EmailMessages = require('./helpers/email-messages');
var SetCookie = require('./helpers/set-cookie');
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
 * @param {object} reply
 */
var SignupHandler = function(request, reply) {
    var token = GenerateToken(); // for email verification
    var payload = JSON.parse(request.payload);

    BcryptPromise.hash(payload.password).then((hash) => {
        var newPilot = {
            email: payload.email,
            password: hash,
            token: token,
            tokenExpirationTime: Date.now() + (1000 * 60 * 60 * 24 * 7), // a week starting from now
            isActivated: false
        };
        return Pilot.create(newPilot);
    }).then((pilot) => {
        // Set cookie with new credentials
        SetCookie(request, pilot.id, pilot.password);

        // Send user email with verification token
        var path = '/email/' + token;
        SendMail(pilot.email, EmailMessages.EMAIL_VERIFICATION, path);

        // Reply with pilot info since it's the only user's data yet
        reply(JSON.stringify(SanitizePilotInfo(pilot)));
    }).catch((err) => {
        reply(JSON.stringify({ error: NormalizeError(err) }));
    });
};


module.exports = SignupHandler;
