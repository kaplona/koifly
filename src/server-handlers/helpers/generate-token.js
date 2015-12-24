'use strict';

var crypto = require('crypto');


/**
 * @return {string}
 */
var GenetateToken = function(len) {
    len = len ? len : 32;
    return crypto.randomBytes(Math.ceil(len * 3/4))
        .toString('base64') // a-z, A-Z, 0-9, / , +
        .slice(0, len)
        .replace(/\+/g, '0') // replace '+' to '0'
        .replace(/\//g, '0'); // replace '/' to '0'
};


module.exports = GenetateToken;
