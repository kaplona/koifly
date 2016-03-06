'use strict';

var crypto = require('crypto');


// TODO add comments, read more about base64

/**
 * @param {number} len
 * @returns {string} string of certain length of random chars (a-z, A-Z, 0-9)
 */
var generateToken = function(len = 32) {
    return crypto
        .randomBytes(Math.ceil(len))
        .toString('base64') // a-z, A-Z, 0-9, / , +
        .replace(/\+/g, '-') // replace '+' to '0'
        .replace(/\//g, '_') // replace '/' to '0'
        .slice(0, len);
};


module.exports = generateToken;
