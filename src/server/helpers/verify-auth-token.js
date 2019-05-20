'use strict';

const BcryptPromise = require('../../utils/bcrypt-promise');
const ErrorTypes = require('../../errors/error-types');
const KoiflyError = require('../../errors/error');
const Pilot = require('../../orm/models/pilots');


/**
 * Search for pilot by id
 * checks that token is still valid
 * compares given token with the hash stored in DB
 * if success clears token info and returns this pilot instance
 * @param {string} pilotId
 * @param {string} authToken
 * @returns {Promise.<pilot>} - sequelize instance of pilot record
 */
const verifyAuthToken = function(pilotId, authToken) {
  let pilot; // we need it to have reference to current pilot

  return Pilot
    .findById(pilotId)
    .then(pilotRecord => {
      pilot = pilotRecord;
      if (!pilot || pilot.id.toString() !== pilotId || pilot.tokenExpirationTime < Date.now()) {
        throw new KoiflyError(ErrorTypes.INVALID_AUTH_TOKEN);
      }

      // Compare auth token with the token hash stored in DB
      return BcryptPromise.compare(authToken, pilot.token);
    })
    .catch(() => {
      throw new KoiflyError(ErrorTypes.INVALID_AUTH_TOKEN);
    })
    .then(() => {
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


module.exports = verifyAuthToken;
