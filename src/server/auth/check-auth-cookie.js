'use strict';

const BcryptPromise = require('../../utils/bcrypt-promise');
const ErrorTypes = require('../../errors/error-types');
const KoiflyError = require('../../errors/error');
const normalizeError = require('../../errors/normalize-error');
const Pilot = require('../../orm/models/pilots');
const setAuthCookie = require('../helpers/set-auth-cookie');


/**
 * @param {object} request
 * @param {object} session
 * @param {function} callback - accepts (Error|null error, bool isSuccess)
 */
const checkAuthCookie = function (request, session, callback) {

  if (!session.userId || session.expiryDate < Date.now()) {
    callback(new KoiflyError(ErrorTypes.AUTHENTICATION_ERROR), false);
    return;
  }

  let pilot; // we need it to have reference to current pilot

  Pilot.findById(session.userId)
    .then(pilotRecord => {
      pilot = pilotRecord;

      if (!pilot || pilot.id !== session.userId) {
        throw new KoiflyError(ErrorTypes.AUTHENTICATION_ERROR);
      }

      const secret = session.expiryDate.toString() + pilot.password;
      return BcryptPromise.compare(secret, session.hash);
    })
    .then(() => {
      // Reset cookie so as to have new expiry date
      return setAuthCookie(request, pilot.id, pilot.password);
    })
    .then(() => {
      callback(null, true); // All OK!
    })
    .catch(error => {
      callback(normalizeError(error), false);
    });
};


module.exports = checkAuthCookie;
