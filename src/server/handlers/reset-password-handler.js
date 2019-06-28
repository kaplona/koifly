'use strict';

import _ from 'lodash';
import BcryptPromise from '../../utils/bcrypt-promise';
import getAllData from '../helpers/get-all-data';
import errorTypes from '../../errors/error-types';
import KoiflyError from '../../errors/error';
import normalizeError from '../../errors/normalize-error';
import setAuthCookie from '../helpers/set-auth-cookie';
import verifyAuthToken from '../helpers/verify-auth-token';

/**
 * Verifies auth token received from client
 * save new password hash in DB
 * sets cookie with new credentials
 * replies with all user's data or error it the latest occurred
 * @param {Object} request
 */
export default function resetPasswordHandler(request) {
  let pilot; // we need it to have reference to current pilot
  const payload = request.payload;

  // Checks payload for required fields
  if (!_.isString(payload.pilotId) ||
    !_.isString(payload.authToken) ||
    !_.isString(payload.password)
  ) {
    return { error: new KoiflyError(errorTypes.BAD_REQUEST) };
  }

  return verifyAuthToken(payload.pilotId, payload.authToken)
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
    .catch(error => {
      return { error: normalizeError(error) };
    });
};
