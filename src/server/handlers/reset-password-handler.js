'use strict';

const _ = require('lodash');
const BcryptPromise = require('../../utils/bcrypt-promise');
const getAllData = require('../helpers/get-all-data');
const ErrorTypes = require('../../errors/error-types');
const KoiflyError = require('../../errors/error');
const normalizeError = require('../../errors/normalize-error');
const setAuthCookie = require('../helpers/set-auth-cookie');
const verifyAuthToken = require('../helpers/verify-auth-token');


/**
 * Verifies auth token received from client
 * save new password hash in DB
 * sets cookie with new credentials
 * replies with all user's data or error it the latest occurred
 * @param {object} request
 * @param {function} reply
 */
const resetPasswordHandler = function(request, reply) {
    let pilot; // we need it to have reference to current pilot
    const payload = request.payload;

    // Checks payload for required fields
    if (!_.isString(payload.pilotId) ||
        !_.isString(payload.authToken) ||
        !_.isString(payload.password)
    ) {
        reply({ error: new KoiflyError(ErrorTypes.BAD_REQUEST) });
        return;
    }

    verifyAuthToken(payload.pilotId, payload.authToken)
        .then(pilotRecord => {
            pilot = pilotRecord;
            // Convert raw user password into hash
            return BcryptPromise.hash(payload.password);
        })
        .then(hash => {
            return pilot.update({ password: hash });
        })
        .then(() => {
            return setAuthCookie(request, pilot.id, pilot.password);
        })
        .then(() => {
            // Password reset was successful
            // Reply with all user's data
            return getAllData(pilot, null);
        })
        .then(dbData => {
            reply(dbData);
        })
        .catch(error => {
            reply({ error: normalizeError(error) });
        });
};


module.exports = resetPasswordHandler;
