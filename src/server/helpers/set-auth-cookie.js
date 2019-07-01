import BcryptPromise from '../../utils/bcrypt-promise';

const COOKIE_LIFETIME = require('../../secrets').cookieLifeTime;

/**
 * @param {object} request
 * @param {number} userId
 * @param {string} passwordHash
 * @returns {Promise} - whether cookie was set
 */
export default function setAuthCookie(request, userId, passwordHash) {
  const expiryDate = Date.now() + COOKIE_LIFETIME;
  const secret = expiryDate.toString() + passwordHash;
  return BcryptPromise
    .hash(secret)
    .then(hash => {
      const cookie = {
        userId: userId,
        expiryDate: expiryDate,
        hash: hash
      };
      request.cookieAuth.set(cookie);
    });
}
