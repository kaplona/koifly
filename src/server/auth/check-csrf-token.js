'use strict';

var _ = require('lodash');

var generateToken = require('../helpers/generate-token');
var ErrorTypes = require('../../errors/error-types');
var KoiflyError = require('../../errors/error');


/**
 * Takes csrf token from request query (get) or payload (post),
 * compares it with the csrf token in cookie
 * if no match - sets new csrf token (in case the old one was expired)
 * and replies with 'invalid csrf token' error
 * if ok - pass control to route handler or next prerequisite
 * @param {object} request
 * @param {function} reply
 */
var checkCsrfToken = function(request, reply) {
    var requestCsrfToken;
    var cookieCsrfToken = request.state.csrf;

    if (request.method === 'get') {
        requestCsrfToken = JSON.parse(request.query.csrf);
    }

    if (request.method === 'post') {
        requestCsrfToken = request.payload.csrf;
    }

    if (!_.isString(cookieCsrfToken) ||
        !_.isString(requestCsrfToken) ||
        cookieCsrfToken !== requestCsrfToken
    ) {
        var csrfToken = generateToken(10);
        reply({ error: new KoiflyError(ErrorTypes.INVALID_CSRF_TOKEN) })
            .takeover() // doesn't invoke route handler and reply directly to the browser
            .state('csrf', csrfToken);
        return;
    }

    reply();
};


module.exports = checkCsrfToken;
