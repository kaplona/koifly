'use strict';

const BcryptPromise = require('../../utils/bcrypt-promise');
const errorTypes = require('../../errors/error-types');
const KoiflyError = require('../../errors/error');
const Pilot = require('../../orm/models/pilots');
const setAuthCookie = require('../helpers/set-auth-cookie');


/**
 * @param {object} request
 * @param {object} session
 */
const checkAuthCookie = function(request, session) {

  if (!session.userId || session.expiryDate < Date.now()) {
    return { valid: false };
  }

  let pilot; // so we have reference to current pilot from several then callbacks

  return Pilot.findByPk(session.userId)
    .then(pilotRecord => {
      pilot = pilotRecord;

      if (!pilot || pilot.id !== session.userId) {
        throw new KoiflyError(errorTypes.AUTHENTICATION_ERROR);
      }

      const secret = session.expiryDate.toString() + pilot.password;
      return BcryptPromise.compare(secret, session.hash);
    })
    .then(() => {
      // Reset cookie so as to have new expiry date
      return setAuthCookie(request, pilot.id, pilot.password);
    })
    .then(() => {
      return { valid: true }; // All OK!
    })
    .catch(() => {
      return { valid: false };
    });
};


module.exports = checkAuthCookie;
