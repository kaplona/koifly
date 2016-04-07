'use strict';

var _ = require('lodash');
var Promise = require('es6-promise').Promise;

const TIMEOUT = require('../constants/data-service-constants').TIMEOUT;

var KoiflyError = require('../errors/error');
var ErrorTypes = require('../errors/error-types');



var AjaxService = {

    /**
     * Sends Ajax requests to the server,
     *
     * @param {Object} options
     *   @param {string} options.url
     *   @param {string} options.method - get or post
     *   @param {Object} [options.data] - for post requests
     *
     * @param {boolean} [isRetry] - is used for csrf attacks,
     * each request to server shall have csrf cookie which value is send to the server along with the request
     * server compare the value received with the request and the cookie value
     * if they don't match it reset cookie (in case it was expired) and 'asks' front end to repeat request
     *
     * @returns {Promise} - resolved with server respond or rejected with  server error
     */
    send: function(options, isRetry) {

        return new Promise((resolve, reject) => {

            var ajaxRequest = new XMLHttpRequest();
            ajaxRequest.timeout = TIMEOUT;

            // If we got response from the server
            ajaxRequest.addEventListener('load', () => {
                if (ajaxRequest.status === 401) {
                    reject(new KoiflyError(ErrorTypes.AUTHENTICATION_ERROR));
                    return;
                }

                if (ajaxRequest.status >= 400 && ajaxRequest.status < 600) {
                    reject(new KoiflyError(ErrorTypes.DB_READ_ERROR));
                    return;
                }

                var serverResponse = JSON.parse(ajaxRequest.responseText);

                // DEV
                console.log('server response:', serverResponse);

                if (serverResponse.error && serverResponse.error.type === ErrorTypes.INVALID_CSRF_TOKEN) {
                    if (isRetry) {
                        reject(new KoiflyError(ErrorTypes.DB_READ_ERROR));
                    } else {
                        console.log('second try...');
                        AjaxService
                            .send(options, true)
                            .then(resolve)
                            .catch(reject);
                    }
                    return;
                }

                if (serverResponse.error) {
                    reject(serverResponse.error);
                    return;
                }

                resolve(serverResponse);
            });

            // If request failed
            ajaxRequest.addEventListener('error', () => reject(new KoiflyError(ErrorTypes.AJAX_NETWORK_ERROR)));
            ajaxRequest.addEventListener('timeout', () => reject(new KoiflyError(ErrorTypes.AJAX_NETWORK_ERROR)));

            // Open and send request
            ajaxRequest.open(options.method, options.url);
            ajaxRequest.send(options.data);
        });
    },


    /**
     * Makes a query string from parsed params and send get request to the server
     * @param {string} url
     * @param {Object} [params]
     * @returns {Promise} - resolved with server respond or rejected with  server error
     */
    get: function(url, params) {
        // Make valid query string from params object
        if (params) {
            url += '?';
            _.each(params, (value, key) => {
                url += key + '=' + JSON.stringify(value) + '&';
            });
            // Add csrf token to prevent csrf attack to the server
            url += 'csrf=' + getCsrfCookie();
        }

        return this.send({ url: url, method: 'get' });
    },


    /**
     *
     * @param {string} url
     * @param {Object} [data]
     * @returns {Promise} - resolved with server respond or rejected with  server error
     */
    post: function(url, data) {
        // Add csrf token to prevent csrf attack to the server
        // json stringify data before sending to the server
        if (data) {
            data.csrf = getCsrfCookie();
            data = JSON.stringify(data);
        }

        return this.send({ url: url, method: 'post', data: data });
    }
};


// idea is from:
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


module.exports = AjaxService;
