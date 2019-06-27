'use strict';

const _ = require('lodash');
const BcryptPromise = require('../../utils/bcrypt-promise');
const emailMessageTemplates = require('../../constants/email-message-templates');
const errorTypes = require('../../errors/error-types');
const KoiflyError = require('../../errors/error');
const normalizeError = require('../../errors/normalize-error');
const Pilot = require('../../orm/models/pilots');
const sendAuthTokenToPilot = require('../helpers/send-auth-token');
const setAuthCookie = require('../helpers/set-auth-cookie');


/**
 * Searches for user corresponding the cookie
 * compares current password given by user with the one in DB
 * saves hash of new password, auth token info and sends email with notification that password has been changed
 * set cookie with new credentials
 * replies success or error if the latest occurred
 * @param {Object} request
 */
const changePasswordHandler = function(request) {
  let pilot; // so we have reference to current pilot from several then callbacks
  const payload = request.payload;

  // Checks payload for required fields
  if (!_.isString(payload.currentPassword) || !_.isString(payload.nextPassword)) {
    return { error: new KoiflyError(errorTypes.BAD_REQUEST) };
  }

  // Check that user are trying to change his/her own data
  if (payload.pilotId !== request.auth.credentials.userId) {
    return { error: new KoiflyError(errorTypes.USER_MISMATCH) };
  }

  return Pilot
    .findByPk(request.auth.credentials.userId)
    .catch(() => {
      throw new KoiflyError(errorTypes.DB_READ_ERROR);
    })
    .then(pilotRecord => {
      pilot = pilotRecord;
      // User can't change password if he didn't verify his email address
      if (!pilot.isActivated) {
        throw new KoiflyError(errorTypes.NEED_EMAIL_VERIFICATION);
      }
      // Compare password provided by user with the one we have in DB
      return BcryptPromise.compare(payload.currentPassword, pilot.password);
    })
    .catch(error => {
      // If it's any other error but KoiflyError will replace it with KoiflyError with given type and message
      throw normalizeError(error, errorTypes.VALIDATION_ERROR, 'You entered wrong password');
    })
    .then(() => {
      // Generate hash from new password
      return BcryptPromise.hash(payload.nextPassword);
    })
    .then(hash => {
      // Change password hash in DB
      return pilot.update({ password: hash });
    })
    .then(() => {
      // Send email notification to user
      // so he has opportunity to reset password
      // if it wasn't he who change the pass at the first place
      sendAuthTokenToPilot(pilot, emailMessageTemplates.PASSWORD_CHANGE, '/reset-password');
      return setAuthCookie(request, pilot.id, pilot.password);
    })
    .then(() => {
      return JSON.stringify('success');
    })
    .catch(error => {
      return { error: normalizeError(error) };
    });
};


module.exports = changePasswordHandler;
