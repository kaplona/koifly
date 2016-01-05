'use strict';

var Pilot = require('../orm/pilots');
var BcryptPromise = require('../utils/bcrypt-promise');
var SetCookie = require('./helpers/set-cookie');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var NormalizeError = require('../utils/error-normalize');


/**
 * @param {object} request
 * @param {object} session
 * @param {function} callback - accepts (Error|null error, bool isSuccess)
 */
var CheckCookie = function(request, session, callback) {
    // DEV
    console.log('=> cookie check');

    if (session.userId === undefined || session.expiryDate < Date.now()) {
        callback(new KoiflyError(ErrorTypes.AUTHENTICATION_FAILURE), false);
        return;
    }

    var pilot; // we need it to have reference to current pilot

    Pilot.findById(session.userId).then((pilotRecord) => {
        pilot = pilotRecord;
        if (!pilot || pilot.id !== session.userId) {
            callback(new KoiflyError(ErrorTypes.AUTHENTICATION_FAILURE), false);
            return;
        }

        var hashBase = session.expiryDate.toString() + pilot.password;
        return BcryptPromise.compare(hashBase, session.hash);
    }).then(() => {
        // Reset cookie so as to have new expiry date
        return SetCookie(request, pilot.id, pilot.password);
    }).then(() => {
        callback(null, true); // All OK!
    }).catch((error) => {
        callback(NormalizeError(error), false);
    });
};


module.exports = CheckCookie;
