'use strict';

var BcryptPromise = require('../../utils/bcrypt-promise');
var Constants = require('../../utils/constants');


/**
 * @param {object} request
 * @param {integer} userId
 * @param {string} passwordHash
 * @returns {Promise}
 */
var SetCookie = function(request, userId, passwordHash) {
    var expiryDate = Date.now() + Constants.cookieLifeTime;
    var hashBase = expiryDate.toString() + passwordHash;
    return BcryptPromise.hash(hashBase).then((hash) => {
        var cookie = {
            userId: userId,
            expiryDate: expiryDate,
            hash: hash
        };
        request.auth.session.set(cookie);
    });
};


module.exports = SetCookie;
