'use strict';

var _ = require('lodash');
var sequelize = require('../orm/sequelize');
var BcryptPromise = require('../utils/bcrypt-promise');
var SetCookie = require('./helpers/set-cookie');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var NormalizeError = require('../utils/error-normalize');
var GetAllData = require('./helpers/get-all-data');
var Pilot = require('../orm/pilots');


sequelize.sync();


/**
 * Searches for a pilot DB record with given email,
 * compares hash of given password with the one in DB
 * if success set cookie and reply to client with all pilot's data
 * @param {object} request
 * @param {function} reply
 */
var LoginHandler = function(request, reply) {
    var pilot; // we need it to have reference to current pilot
    var payload = JSON.parse(request.payload);

    // Checks payload for required fields
    if (!_.isString(payload.email) || !_.isString(payload.password)) {
        reply({ error: new KoiflyError(ErrorTypes.RETRIEVING_FAILURE) });
        return;
    }

    // email is stored in lower case in DB, so as to perform case insensitivity
    Pilot.findOne({ where: { email: payload.email.toLowerCase() } }).then((pilotRecord) => {
        if (!pilotRecord || pilotRecord.email !== payload.email.toLowerCase()) {
            throw new KoiflyError(ErrorTypes.AUTHENTICATION_FAILURE, 'There is no user with this email');
        }
        pilot = pilotRecord;
        // Compare password provided by user with the one we have in DB
        return BcryptPromise.compare(payload.password, pilot.password);
    }).catch((error) => {
        error = error ? error : new KoiflyError(ErrorTypes.AUTHENTICATION_FAILURE, 'You entered wrong password');
        throw error;
    }).then(() => {
        return SetCookie(request, pilot.id, pilot.password);
    }).then(() => {
        // Log in was successful
        // Reply with all user's data starting from the latest date user has on the front end
        // e.g. if user was logged out due to expiring cookie but still has data in js
        // this saves amount of data sending between server and client
        return GetAllData(pilot, payload.lastModified);
    }).then((dbData) => {
        reply(dbData);
    }).catch((error) => {
        reply({ error: NormalizeError(error) });
    });
};


module.exports = LoginHandler;
