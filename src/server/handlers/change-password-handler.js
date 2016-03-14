'use strict';

var _ = require('lodash');

var BcryptPromise = require('../../utils/bcrypt-promise');
var EmailMessageTemplates = require('../../constants/email-message-templates');
var ErrorTypes = require('../../errors/error-types');
var KoiflyError = require('../../errors/error');
var normalizeError = require('../../errors/normalize-error');
var Pilot = require('../../orm/pilots');
var sendAuthTokenToPilot = require('../helpers/send-auth-token');
var setAuthCookie = require('../helpers/set-auth-cookie');




/**
 * Searches for user corresponding the cookie
 * compares current password given by user with the one in DB
 * saves hash of new password, auth token info and sends email with notification that password has been changed
 * set cookie with new credentials
 * replies success or error if the latest occurred
 * @param {object} request
 * @param {function} reply
 */
var changePasswordHandler = function(request, reply) {
    var pilot; // we need it to have reference to current pilot
    var payload = JSON.parse(request.payload);

    // Checks payload for required fields
    if (!_.isString(payload.currentPassword) || !_.isString(payload.nextPassword)) {
        reply({ error: new KoiflyError(ErrorTypes.BAD_REQUEST) });
        return;
    }

    Pilot
        .findById(request.auth.credentials.userId)
        .catch(() => {
            throw new KoiflyError(ErrorTypes.DB_READ_ERROR);
        })
        .then((pilotRecord) => {
            pilot = pilotRecord;
            // User can't change password if he didn't verify his email address
            if (!pilot.isActivated) {
                throw new KoiflyError(ErrorTypes.NEED_EMAIL_VERIFICATION);
            }
            // Compare password provided by user with the one we have in DB
            return BcryptPromise.compare(payload.currentPassword, pilot.password);
        })
        .catch((error) => {
            // If it's any other error but KoiflyError will replace it with KoiflyError with given type and message
            throw normalizeError(error, ErrorTypes.VALIDATION_ERROR, 'You entered wrong password');
        })
        .then(() => {
            // Generate hash from new password
            return BcryptPromise.hash(payload.nextPassword);
        })
        .then((hash) => {
            // Change password hash in DB
            return pilot.update({ password: hash });
        })
        .then(() => {
            // Send email notification to user
            // so he has opportunity to reset password
            // if it wasn't he who change the pass at the first place
            sendAuthTokenToPilot(pilot, EmailMessageTemplates.PASSWORD_CHANGE, '/reset-password/');
            return setAuthCookie(request, pilot.id, pilot.password);
        })
        .then(() => {
            reply(JSON.stringify('success'));
        })
        .catch((error) => {
            reply({ error: normalizeError(error) });
        });
};


module.exports = changePasswordHandler;
