'use strict';

const _ = require('lodash');
const BcryptPromise = require('../../utils/bcrypt-promise');
const getPilotValuesForFrontend = require('../helpers/get-pilot-values');
const EmailMessageTemplates = require('../../constants/email-message-templates');
const ErrorTypes = require('../../errors/error-types');
const KoiflyError = require('../../errors/error');
const normalizeError = require('../../errors/normalize-error');
const Pilot = require('../../orm/models/pilots');
const sendAuthTokenToPilot = require('../helpers/send-auth-token');
const setAuthCookie = require('../helpers/set-auth-cookie');


/**
 * Creates a new user/pilot in DB with given email and hash of given password,
 * set cookie,
 * generates random token, saves it in DB,
 * send email with verification link to new user's email,
 * replies with only pilot info since new user doesn't have any other data yet
 * @param {Object} request
 */
const signupHandler = function (request) {
  let pilot; // we need it to have reference to current pilot
  const payload = request.payload;

  // Checks payload for required fields
  if (!_.isString(payload.email) || !_.isString(payload.password)) {
    return { error: new KoiflyError(ErrorTypes.BAD_REQUEST) };
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
      sendAuthTokenToPilot(pilot, EmailMessageTemplates.EMAIL_VERIFICATION, '/email-verification');
      // Reply with pilot info since it's the only user's data yet
      return getPilotValuesForFrontend(pilot);
    })
    .catch(error => {
      return { error: normalizeError(error) };
    });
};


module.exports = signupHandler;
