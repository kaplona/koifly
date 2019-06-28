'use strict';

import emailMessageTemplates from '../../constants/email-message-templates';
import normalizeError from '../../errors/normalize-error';
import Pilot from '../../orm/models/pilots';
import sendAuthTokenToPilot from '../helpers/send-auth-token';

/**
 * Finds a pilot by id provided in cookie,
 * sends him a link with auth token to verify his email
 * reply to client with 'success' or error if the latest occurred
 * @param {Object} request
 */
export default function resendAuthTokenHandler(request) {
  return Pilot
    .findByPk(request.auth.credentials.userId)
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
