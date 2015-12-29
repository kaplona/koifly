'use strict';

var Pilot = require('../orm/pilots');
var BcryptPromise = require('../utils/bcrypt-promise');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var NormalizeError = require('../utils/error-normalize');


/**
 *
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

    Pilot.findById(session.userId).then((pilot) => {
        if (!pilot || pilot.id !== session.userId) {
            callback(new KoiflyError(ErrorTypes.AUTHENTICATION_FAILURE), false);
            return;
        }

        var hashBase = session.expiryDate.toString() + pilot.password;
        return BcryptPromise.compare(hashBase, session.hash);
    }).then(() => {
        callback(null, true); // All OK!
    }).catch((error) => {
        callback(NormalizeError(error), false);
    });
};


module.exports = CheckCookie;
