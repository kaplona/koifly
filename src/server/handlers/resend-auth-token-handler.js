'use strict';

const EmailMessageTemplates = require('../../constants/email-message-templates');
const normalizeError = require('../../errors/normalize-error');
const Pilot = require('../../orm/models/pilots');
const sendAuthTokenToPilot = require('../helpers/send-auth-token');


/**
 * Finds a pilot by id provided in cookie,
 * sends him a link with auth token to verify his email
 * reply to client with 'success' or error if the latest occurred
 * @param {object} request
 * @param {function} reply
 */
const resendAuthTokenHandler = function (request, reply) {
  Pilot
    .findById(request.auth.credentials.userId)
    .then(pilot => {
      return sendAuthTokenToPilot(pilot, EmailMessageTemplates.EMAIL_VERIFICATION, '/email-verification');
    })
    .then(() => {
      reply(JSON.stringify('success'));
    })
    .catch(error => {
      reply({error: normalizeError(error)});
    });
};


module.exports = resendAuthTokenHandler;
