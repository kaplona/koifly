'use strict';

var Pilot = require('../orm/pilots');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var NormalizeError = require('../utils/error-normalize');


var CheckCookie = function(request, session, callback) {
    // DEV
    console.log('=> cookie check');


    if (session.userId === undefined) {
        return callback(new KoiflyError(ErrorTypes.AUTHENTICATION_FAILURE), false);
    }

    var whereQuery = {
        id: session.userId,
        password: session.hash
    };
    Pilot.findOne({ where: whereQuery }).then((pilot) => {
        if (pilot === null) {
            return callback(new KoiflyError(ErrorTypes.AUTHENTICATION_FAILURE), false);
        }

        callback(null, true);
    }).catch((error) => {
        callback(NormalizeError(error), false);
    });
};


module.exports = CheckCookie;
