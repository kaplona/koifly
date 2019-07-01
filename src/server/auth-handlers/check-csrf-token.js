import _ from 'lodash';
import generateToken from '../helpers/generate-token';
import errorTypes from '../../errors/error-types';
import KoiflyError from '../../errors/error';

/**
 * Takes csrf token from request query (get) or payload (post),
 * compares it with the csrf token in cookie
 * if no match - sets new csrf token (in case the old one was expired)
 * and replies with 'invalid csrf token' error
 * if ok - pass control to route handler or next prerequisite
 * @param {Object} request
 * @param {Object} reply – Response toolkit.
 */
export default function checkCsrfToken(request, reply) {
  let requestCsrfToken;
  const cookieCsrfToken = request.state.csrf;

  if (request.method === 'get') {
    requestCsrfToken = JSON.parse(request.query.csrf);
  }

  if (request.method === 'post') {
    requestCsrfToken = request.payload.csrf;
  }

  if (
    !_.isString(cookieCsrfToken) ||
    !_.isString(requestCsrfToken) ||
    cookieCsrfToken !== requestCsrfToken
  ) {
    const csrfToken = generateToken(10);
    const response = reply.response({ error: new KoiflyError(errorTypes.INVALID_CSRF_TOKEN) });
    response.state('csrf', csrfToken);

    return response;
  }

  return reply.continue;
}
