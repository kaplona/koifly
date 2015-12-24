'use strict';

var VerifyEmailToken = require('./helpers/verify-email');
var BcryptPromise = require('../utils/bcrypt-promise');
var SetCookie = require('./helpers/set-cookie');
var GetAllData = require('./helpers/get-all-data');
var NormalizeError = require('../utils/error-normalize');


var ResetPassHandler = function(request, reply) {
    var pilot; // we need it to have reference to current pilot
    var payload = JSON.parse(request.payload);

    VerifyEmailToken(payload.token).then((pilotRecord) => {
        pilot = pilotRecord;

        // Convert raw user password into hash
        return BcryptPromise.hash(payload.password);
    }).then((hash) => {
        return pilot.update({ password: hash });
    }).then((pilot) => {
        SetCookie(request, pilot.id, pilot.password);

        // Password reset was successful
        // Reply with all user's data
        return GetAllData(pilot, null);
    }).then((dbData) => {
        reply(JSON.stringify(dbData));
    }).catch((error) => {
        reply(JSON.stringify({error: NormalizeError(error)}));
    });
};


module.exports = ResetPassHandler;
