'use strict';

const BcryptPromise = require('../../utils/bcrypt-promise');

const COOKIE_LIFETIME = require('../../secrets').cookieLifeTime;


/**
 * @param {object} request
 * @param {number} userId
 * @param {string} passwordHash
 * @returns {Promise} - whether cookie was set
 */
const setAuthCookie = function (request, userId, passwordHash) {
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
};


module.exports = setAuthCookie;
