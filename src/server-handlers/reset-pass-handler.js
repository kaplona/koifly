'use strict';

var _ = require('lodash');
var VerifyEmailToken = require('./helpers/verify-email');
var BcryptPromise = require('../utils/bcrypt-promise');
var SetCookie = require('./helpers/set-cookie');
var GetAllData = require('./helpers/get-all-data');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var NormalizeError = require('../utils/error-normalize');


var ResetPassHandler = function(request, reply) {
    var pilot; // we need it to have reference to current pilot
    var payload = JSON.parse(request.payload);

    // Checks payload for required fields
    if (!_.isString(payload.token) || !_.isString(payload.password)) {
        reply({ error: new KoiflyError(ErrorTypes.RETRIEVING_FAILURE) });
        return;
    }

    VerifyEmailToken(payload.token).then((pilotRecord) => {
        pilot = pilotRecord;
        // Convert raw user password into hash
        return BcryptPromise.hash(payload.password);
    }).then((hash) => {
        return pilot.update({ password: hash });
    }).then((pilotRecord) => {
        pilot = pilotRecord;
        return SetCookie(request, pilot.id, pilot.password);
    }).then(() => {
        // Password reset was successful
        // Reply with all user's data
        return GetAllData(pilot, null);
    }).then((dbData) => {
        reply(dbData);
    }).catch((error) => {
        reply({error: NormalizeError(error)});
    });
};


module.exports = ResetPassHandler;
