'use strict';

var _ = require('lodash');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');


var ajaxTimeout = 6000;

// options properties: url, method (get or post), params (for get request), data (for post request),
// onSuccess, onFailure (functions triggered on certain events)
var AjaxService = function(options) {
    var ajaxRequest = new XMLHttpRequest();
    ajaxRequest.timeout = ajaxTimeout;

    options.data = options.data ? JSON.stringify(options.data) : undefined;

    if (options.params && options.method === 'get') {
        options.url += '?';
        _.map(options.params, (value, key) => {
            options.url += key + '=' + JSON.stringify(value) + '&';
        });
        options.url = options.url.slice(0, -1);
    }

    ajaxRequest.addEventListener('load', () => {
        if (ajaxRequest.status === 401) {
            options.onFailure(new KoiflyError(ErrorTypes.AUTHENTICATION_FAILURE));
            return;
        }

        if (ajaxRequest.status >= 400 && ajaxRequest.status < 500) {
            options.onFailure(new KoiflyError(ErrorTypes.CONNECTION_FAILURE));
            return;
        }

        var serverResponse = JSON.parse(ajaxRequest.responseText);

        // DEV
        console.log('server response:', serverResponse);

        if (serverResponse.error) {
            options.onFailure(serverResponse.error);
            return;
        }

        options.onSuccess(serverResponse);
    });
    ajaxRequest.addEventListener('error', () => options.onFailure(new KoiflyError(ErrorTypes.CONNECTION_FAILURE)));
    ajaxRequest.addEventListener('timeout', () => options.onFailure(new KoiflyError(ErrorTypes.CONNECTION_FAILURE)));
    ajaxRequest.open(options.method, options.url);
    ajaxRequest.send(options.data);
};


module.exports = AjaxService;
