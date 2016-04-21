'use strict';

var BcryptPromise = require('../../utils/bcrypt-promise');

const COOKIE_LIFETIME = require('../../secrets').cookieLifeTime;


/**
 * @param {object} request
 * @param {number} userId
 * @param {string} passwordHash
 * @returns {Promise} - whether cookie was set
 */
var setAuthCookie = function(request, userId, passwordHash) {
    var expiryDate = Date.now() + COOKIE_LIFETIME;
    var secret = expiryDate.toString() + passwordHash;
    return BcryptPromise
        .hash(secret)
        .then(hash => {
            var cookie = {
                userId: userId,
                expiryDate: expiryDate,
                hash: hash
            };
            request.auth.session.set(cookie);
        });
};


module.exports = setAuthCookie;
