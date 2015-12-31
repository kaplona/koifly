'use strict';

var sequelize = require('../../orm/sequelize');
var BcryptPromise = require('../../utils/bcrypt-promise');
var KoiflyError = require('../../utils/error');
var ErrorTypes = require('../../utils/error-types');
var Pilot = require('../../orm/pilots');


sequelize.sync();


/**
 * Search for pilot by id
 * checks that token is still valid
 * compares given token with the hash stored in DB
 * if success clears token info and returns this pilot instance
 * @param {string} pilotId
 * @param {string} token
 * @returns {Promise.<pilot>} - sequelize instance of pilot record
 * @constructor
 */
var VerifyEmailToken = function(pilotId, token) {
    var pilot; // we need it to have reference to current pilot

    return Pilot.findById(pilotId).then((pilotRecord) => {
        pilot = pilotRecord;
        if (!pilot || pilot.id.toString() !== pilotId || pilot.tokenExpirationTime < Date.now()) {
            throw new KoiflyError(ErrorTypes.INVALID_TOKEN);
        }

        // Compare token with the token hash stored in DB
        return BcryptPromise.compare(token, pilot.token);
    }).catch(() => {
        throw new KoiflyError(ErrorTypes.INVALID_TOKEN);
    }).then(() => {
        // Everything is OK
        // Mark pilot as activated
        // Clear token info
        return pilot.update({
            token: null,
            tokenExpirationTime: null,
            isActivated: true
        });
    });
};


module.exports = VerifyEmailToken;
