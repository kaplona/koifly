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
     * @private
     *
     * @param {object} options
     *   @param {string} options.url
     *   @param {string} options.method - get or post
     *   @param {object} [options.queryParams] - for get requests
     *   @param {object} [options.data] - for post requests
     *
     * @param {boolean} [isRetry] - is used to prevent csrf attacks,
     * each request to server shall have csrf cookie which value is send to the server along with the request
     * server compare the value received with the request and the cookie value
     * if they don't match it reset cookie (in case it was expired) and 'asks' front end to repeat request
     *
     * @returns {Promise} - resolved with server respond or rejected with  server error
     */
    send: function(options, isRetry) {

        var url = options.url;
        var data = options.data;
        var csrfCookie = this.getCsrfCookie();

        if (options.method === 'get') {
            // Make valid query string from params object
            // Add csrf token to prevent csrf attack to the server
            url = url + '?' + this.buildQuery(_.extend({}, options.queryParams, { csrf: csrfCookie }));
        }

        if (options.method === 'post') {
            // Add csrf token to prevent csrf attack to the server
            data.csrf = csrfCookie;
        }

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

                if (process.env.NODE_ENV === 'development') {
                    console.log('server response:', serverResponse);
                }

                if (!serverResponse.error) {
                    resolve(serverResponse);
                    return;
                }

                if (serverResponse.error.type === ErrorTypes.INVALID_CSRF_TOKEN) {
                    if (isRetry) {
                        reject(new KoiflyError(ErrorTypes.DB_READ_ERROR));
                    } else {
                        AjaxService
                            .send(options, true)
                            .then(resolve)
                            .catch(reject);
                    }
                    return;
                }

                reject(serverResponse.error);
            });

            // If request failed
            ajaxRequest.addEventListener('error', () => reject(new KoiflyError(ErrorTypes.AJAX_NETWORK_ERROR)));
            ajaxRequest.addEventListener('timeout', () => reject(new KoiflyError(ErrorTypes.AJAX_NETWORK_ERROR)));

            // Open and send request
            ajaxRequest.open(options.method, url);
            ajaxRequest.send(data ? JSON.stringify(data) : null);
        });
    },


    /**
     * @param {string} url
     * @param {Object} [queryParams]
     * @returns {Promise} - resolved with server respond or rejected with  server error
     */
    get: function(url, queryParams) {
        return this.send({ url: url, method: 'get', queryParams: queryParams });
    },


    /**
     * @param {string} url
     * @param {Object} [data]
     * @returns {Promise} - resolved with server respond or rejected with  server error
     */
    post: function(url, data = {}) {
        return this.send({ url: url, method: 'post', data: data });
    },


    /**
     * @private
     * @param {object} queryParams
     * @returns {string} - valid url query
     */
    buildQuery: function(queryParams) {
        return Object
            .keys(queryParams)
            .map(key => {
                return encodeURIComponent(key) + '=' + encodeURIComponent(JSON.stringify(queryParams[key]));
            })
            .join('&');
    },


    /**
     * Idea from:
     * http://stackoverflow.com/questions/10730362/get-cookie-by-name
     *
     * @private
     * @returns {string|null} - csrf token or null if there is no such
     */
    getCsrfCookie: function() {
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
};


module.exports = AjaxService;
