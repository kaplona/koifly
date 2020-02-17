import errorTypes from '../../errors/error-types';
import KoiflyError from '../../errors/error';
import emailMessageTemplates from '../../constants/email-message-templates';
import normalizeError from '../../errors/normalize-error';
import Pilot from '../../orm/models/pilots';
import sendAuthTokenToPilot from '../helpers/send-auth-token';

/**
 * Checks that we got email from the client,
 * finds a pilot with this email address,
 * sends him a link with auth token for one-time-login, reset password or other
 * reply to client with 'success' or error if the latest occurred
 * @param {Object} request
 */
export default function sendAuthTokenHandler(request) {
  const payload = request.payload;

  // Checks payload for required fields
  if (typeof payload.email !== 'string') {
    return { error: new KoiflyError(errorTypes.BAD_REQUEST) };
  }

  let emailMessage;
  let path;

  if (request.path === '/api/one-time-login') {
    emailMessage = emailMessageTemplates.ONE_TIME_LOGIN;
    path = '/email-verification';
  }

  if (request.path === '/api/initiate-reset-password') {
    emailMessage = emailMessageTemplates.PASSWORD_RESET;
    path = '/reset-password';
  }

  // email is stored in lower case in DB, so as to perform case insensitivity
  return Pilot
    .findOne({ where: { email: payload.email.toLowerCase() } })
    .then(pilot => {
      if (pilot && pilot.email === payload.email.toLowerCase()) {
        return sendAuthTokenToPilot(pilot, emailMessage, path);
      }

      throw new KoiflyError(errorTypes.RECORD_NOT_FOUND, 'There is no pilot with this email');
    })
    .then(() => {
      return JSON.stringify('success');
    })
    .catch(error => {
      return { error: normalizeError(error) };
    });
}
