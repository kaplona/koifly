'use strict';

var _ = require('lodash');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var GenerateToken = require('./helpers/generate-token');


/**
 * Takes csrf token from request query (get) or payload (post),
 * compares it with the csrf token in cookie
 * if no match - sets new csrf token (in case the old one was expired)
 * and replies with 'invalid csrf token' error
 * if ok - pass control to route handler or next prerequisite
 * @param {object} request
 * @param {function} reply
 */
var CheckCsrfToken = function(request, reply) {
    var requestCsrfToken;
    var cookieCsrfToken = request.state.csrf;

    if (request.method === 'get') {
        requestCsrfToken = request.query.csrf;
    }

    if (request.method === 'post') {
        var payload = JSON.parse(request.payload);
        requestCsrfToken = payload.csrf;
    }

    // DEV
    console.log('=> pre handler => ', cookieCsrfToken === requestCsrfToken);

    if (!_.isString(cookieCsrfToken) ||
        !_.isString(requestCsrfToken) ||
        cookieCsrfToken !== requestCsrfToken
    ) {
        var token = GenerateToken(10);
        var error = new KoiflyError(ErrorTypes.INVALID_CSRF_TOKEN);
        console.log('=> error => ', error);
        reply({ error: error }).takeover().state('csrf', token);
        return;
    }

    reply();
};


module.exports = CheckCsrfToken;
