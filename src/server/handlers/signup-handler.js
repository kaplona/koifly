'use strict';

import _ from 'lodash';
import BcryptPromise from '../../utils/bcrypt-promise';
import getPilotValuesForFrontend from '../helpers/get-pilot-values';
import emailMessageTemplates from '../../constants/email-message-templates';
import errorTypes from '../../errors/error-types';
import KoiflyError from '../../errors/error';
import normalizeError from '../../errors/normalize-error';
import Pilot from '../../orm/models/pilots';
import sendAuthTokenToPilot from '../helpers/send-auth-token';
import setAuthCookie from '../helpers/set-auth-cookie';

/**
 * Creates a new user/pilot in DB with given email and hash of given password,
 * set cookie,
 * generates random token, saves it in DB,
 * send email with verification link to new user's email,
 * replies with only pilot info since new user doesn't have any other data yet
 * @param {Object} request
 */
export default function signupHandler(request) {
  let pilot; // we need it to have reference to current pilot
  const payload = request.payload;

  // Checks payload for required fields
  if (!_.isString(payload.email) || !_.isString(payload.password)) {
    return { error: new KoiflyError(errorTypes.BAD_REQUEST) };
  }

  return BcryptPromise
    .hash(payload.password)
    .then(hash => {
      const newPilot = {
        email: payload.email,
        password: hash,
        isSubscribed: payload.isSubscribed,
        isActivated: false
      };
      return Pilot.create(newPilot);
    })
    .then(pilotRecord => {
      pilot = pilotRecord;
      // Set cookie with new credentials
      return setAuthCookie(request, pilot.id, pilot.password);
    })
    .then(() => {
      // Send user email with auth verification token
      sendAuthTokenToPilot(pilot, emailMessageTemplates.EMAIL_VERIFICATION, '/email-verification');
      // Reply with pilot info since it's the only user's data yet
      return getPilotValuesForFrontend(pilot);
    })
    .catch(error => {
      return { error: normalizeError(error) };
    });
};
