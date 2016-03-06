'use strict';

var BcryptPromise = require('../../utils/bcrypt-promise');
var ErrorTypes = require('../../errors/error-types');
var KoiflyError = require('../../errors/error');
var normalizeError = require('../../errors/normalize-error');
var Pilot = require('../../orm/pilots');
var setAuthCookie = require('../helpers/set-auth-cookie');


/**
 * @param {object} request
 * @param {object} session
 * @param {function} callback - accepts (Error|null error, bool isSuccess)
 */
var checkAuthCookie = function(request, session, callback) {
    // DEV
    console.log('=> cookie check');

    if (!session.userId || session.expiryDate < Date.now()) {
        callback(new KoiflyError(ErrorTypes.AUTHENTICATION_ERROR), false);
        return;
    }

    var pilot; // we need it to have reference to current pilot

    Pilot.findById(session.userId)
        .then((pilotRecord) => {
            pilot = pilotRecord;

            if (!pilot || pilot.id !== session.userId) {
                throw new KoiflyError(ErrorTypes.AUTHENTICATION_ERROR);
            }

            var hashBase = session.expiryDate.toString() + pilot.password;
            return BcryptPromise.compare(hashBase, session.hash);
        })
        .then(() => {
            // Reset cookie so as to have new expiry date
            return setAuthCookie(request, pilot.id, pilot.password);
        })
        .then(() => {
            callback(null, true); // All OK!
        })
        .catch((error) => {
            callback(normalizeError(error), false);
        });
};


module.exports = checkAuthCookie;
