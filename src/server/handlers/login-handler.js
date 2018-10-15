'use strict';

var _ = require('lodash');

var BcryptPromise = require('../../utils/bcrypt-promise');
var getAllData = require('../helpers/get-all-data');
var ErrorTypes = require('../../errors/error-types');
var KoiflyError = require('../../errors/error');
var normalizeError = require('../../errors/normalize-error');
var Pilot = require('../../orm/models/pilots');
var setAuthCookie = require('../helpers/set-auth-cookie');



/**
 * Searches for a pilot DB record with given email,
 * compares hash of given password with the one in DB
 * if success set cookie and reply to client with all pilot's data
 * @param {object} request
 * @param {function} reply
 */
var loginHandler = function(request, reply) {
    var pilot; // we need it to have reference to current pilot
    var payload = request.payload;

    // Checks payload for required fields
    if (!_.isString(payload.email) || !_.isString(payload.password)) {
        reply({ error: new KoiflyError(ErrorTypes.BAD_REQUEST) });
        return;
    }

    // email is stored in lower case in DB, so as to perform case insensitivity
    Pilot
        .findOne({ where: { email: payload.email.toLowerCase() } })
        .catch(() => {
            throw new KoiflyError(ErrorTypes.DB_READ_ERROR);
        })
        .then(pilotRecord => {
            if (!pilotRecord || pilotRecord.email !== payload.email.toLowerCase()) {
                throw new KoiflyError(ErrorTypes.AUTHENTICATION_ERROR, 'There is no user with this email');
            }
            pilot = pilotRecord;
            // Compare password provided by user with the one we have in DB
            return BcryptPromise.compare(payload.password, pilot.password);
        })
        .catch(error => {
            // If it's any other error but KoiflyError will replace it with KoiflyError with given type and message
            throw normalizeError(error, ErrorTypes.AUTHENTICATION_ERROR, 'You entered wrong password');
        })
        .then(() => {
            return setAuthCookie(request, pilot.id, pilot.password);
        })
        .then(() => {
            // Log in was successful
            // Reply with all user's data starting from the latest date user has on the front end
            // e.g. if user was logged out due to expiring cookie but still has data in js
            // this saves amount of data sending between server and client
            return getAllData(pilot, payload.lastModified);
        })
        .then(dbData => {
            reply(dbData);
        })
        .catch(error => {
            reply({ error: normalizeError(error) });
        });
};


module.exports = loginHandler;
