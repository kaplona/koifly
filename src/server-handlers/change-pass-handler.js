'use strict';

var _ = require('lodash');
var sequelize = require('../orm/sequelize');
var Pilot = require('../orm/pilots');
var BcryptPromise = require('../utils/bcrypt-promise');
var SetCookie = require('./helpers/set-cookie');
var SendTokenToPilot = require('./helpers/send-token');
var EmailMessages = require('./helpers/email-messages');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var NormalizeError = require('../utils/error-normalize');


sequelize.sync();


/**
 * Searches for user corresponding the cookie
 * compares old password given by user with the one in DB
 * saves hash of new password, token info and sends email with notification that password has been changed
 * set cookie with new credentials
 * replies success or error if the latest occurred
 * @param {object} request
 * @param {function} reply
 */
var ChangePassHandler = function(request, reply) {
    var pilot; // we need it to have reference to current pilot
    var payload = JSON.parse(request.payload);

    // Checks payload for required fields
    if (!_.isString(payload.oldPassword) || !_.isString(payload.newPassword)) {
        reply({ error: new KoiflyError(ErrorTypes.RETRIEVING_FAILURE) });
        return;
    }

    Pilot.findById(request.auth.credentials.userId).then((pilotRecord) => {
        pilot = pilotRecord;
        // User can't change password if he didn't verified his email address
        if (!pilot.isActivated) {
            throw new KoiflyError(ErrorTypes.NOT_ACTIVATED_USER);
        }
        // Compare password provided by user with the one we have in DB
        return BcryptPromise.compare(payload.oldPassword, pilot.password);
    }).catch((error) => {
        error = error ? error : new KoiflyError(ErrorTypes.SAVING_FAILURE, 'You entered wrong password');
        throw error;
    }).then(() => {
        // Generate hash from new password
        return BcryptPromise.hash(payload.newPassword);
    }).then((hash) => {
        // Change password hash in DB
        return pilot.update({ password: hash });
    }).then((pilotRecord) => {
        pilot = pilotRecord;
        // Send email notification to user
        // so he has opportunity to reset password
        // if it wasn't he who change the pass at the first place
        return SendTokenToPilot(pilot, EmailMessages.PASSWORD_CHANGE, '/reset-pass/');
    }).then(() => {
        // Set cookie with new credentials
        return SetCookie(request, pilot.id, pilot.password);
    }).then(() => {
        reply(JSON.stringify('success'));
    }).catch((error) => {
        reply({ error: NormalizeError(error) });
    });
};


module.exports = ChangePassHandler;
