'use strict';

var _ = require('lodash');
var KoiflyError = require('../errors/error');
var ErrorTypes = require('../errors/error-types');


var ajaxTimeout = 6000;

// http://stackoverflow.com/questions/10730362/get-cookie-by-name
function getCsrfCookie() {
    // Prepend '; ' to cookie string
    // so as to have '; name=value; name=value;'
    // in this case we are sure that 'csrf' is a full cookie name
    var value = '; ' + document.cookie;

    // divide cookie string into two parts,
    // where the second one starts with the csrf cookie value
    var parts = value.split('; csrf=');

    // If there is a cookie with 'csrf' name
    if (parts.length === 2) {
        // Take the second part of cookie string (with the value we need)
        // then take everything before ';'
        return parts.pop().split(';')[0];
    }

    return null;
}

/**
 * Sends Ajax requests to the server,
 * options properties: url, method (get or post), params (for get request), data (for post request),
 * onSuccess, onFailure (functions triggered on certain events)
 * @param {object} originalOptions
 * @param {boolean} isRetry - is used for csrf attacks,
 * each request to server shall have csrf cookie which value is send to the server along with the request
 * server compare the value received with the request and the cookie value
 * if they don't match it reset cookie (in case it was expired) and 'asks' front end to repeat request
 */
var ajaxService = function(originalOptions, isRetry) {
    var ajaxRequest = new XMLHttpRequest();
    ajaxRequest.timeout = ajaxTimeout;

    // Need to preserve original options in order to resend the same request
    var options = _.extend({}, originalOptions);

    // if method get - make valid query string from params object
    if (options.params && options.method === 'get') {
        options.url += '?';
        _.each(options.params, (value, key) => {
            options.url += key + '=' + JSON.stringify(value) + '&';
        });
        // Add csrf token to prevent csrf attack to the server
        options.url += 'csrf=' + getCsrfCookie();
    }

    // If method post - json stringify data before sending to the server
    if (options.data && options.method === 'post') {
        // Add csrf token to prevent csrf attack to the server
        options.data.csrf = getCsrfCookie();
        options.data = JSON.stringify(options.data);
    }

    // If we got response from the server
    ajaxRequest.addEventListener('load', () => {
        if (ajaxRequest.status === 401) {
            options.onFailure(new KoiflyError(ErrorTypes.AUTHENTICATION_ERROR));
            return;
        }

        if (ajaxRequest.status >= 400 && ajaxRequest.status < 600) {
            options.onFailure(new KoiflyError(ErrorTypes.DB_READ_ERROR));
            return;
        }

        var serverResponse = JSON.parse(ajaxRequest.responseText);

        // DEV
        console.log('server response:', serverResponse);

        if (serverResponse.error && serverResponse.error.type === ErrorTypes.INVALID_CSRF_TOKEN) {
            if (isRetry) {
                options.onFailure(new KoiflyError(ErrorTypes.DB_READ_ERROR));
            } else {
                console.log('second try...');
                ajaxService(originalOptions, true);
            }
            return;
        }

        if (serverResponse.error) {
            options.onFailure(serverResponse.error);
            return;
        }

        options.onSuccess(serverResponse);
    });

    // If request failed
    ajaxRequest.addEventListener('error', () => options.onFailure(new KoiflyError(ErrorTypes.AJAX_NETWORK_ERROR)));
    ajaxRequest.addEventListener('timeout', () => options.onFailure(new KoiflyError(ErrorTypes.AJAX_NETWORK_ERROR)));

    // Open and send request
    ajaxRequest.open(options.method, options.url);
    ajaxRequest.send(options.data);
};


module.exports = ajaxService;
