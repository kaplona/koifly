'use strict';

var Pilot = require('../orm/pilots');
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


    if (session.userId === undefined) {
        callback(new KoiflyError(ErrorTypes.AUTHENTICATION_FAILURE), false);
        return;
    }

    var whereQuery = {
        id: session.userId,
        password: session.hash
    };
    Pilot.findOne({ where: whereQuery }).then((pilot) => {
        if (pilot && pilot.id === session.userId) {
            callback(null, true); // All OK!
            return;
        }

        callback(new KoiflyError(ErrorTypes.AUTHENTICATION_FAILURE), false);

    }).catch((error) => {
        callback(NormalizeError(error), false);
    });
};


module.exports = CheckCookie;
