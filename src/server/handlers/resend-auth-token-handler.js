'use strict';

const emailMessageTemplates = require('../../constants/email-message-templates');
const normalizeError = require('../../errors/normalize-error');
const Pilot = require('../../orm/models/pilots');
const sendAuthTokenToPilot = require('../helpers/send-auth-token');


/**
 * Finds a pilot by id provided in cookie,
 * sends him a link with auth token to verify his email
 * reply to client with 'success' or error if the latest occurred
 * @param {Object} request
 */
const resendAuthTokenHandler = function(request) {
  return Pilot
    .findById(request.auth.credentials.userId)
    .then(pilot => {
      return sendAuthTokenToPilot(pilot, emailMessageTemplates.EMAIL_VERIFICATION, '/email-verification');
    })
    .then(() => {
      return JSON.stringify('success');
    })
    .catch(error => {
      return { error: normalizeError(error) };
    });
};


module.exports = resendAuthTokenHandler;
