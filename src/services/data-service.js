'use strict';

var _ = require('lodash');
var AjaxService = require('./ajax-service');
var PubSub = require('../utils/pubsub');


var DataService = function() {

    this.lastModified = null;

    this.store = {
        pilot: null,
        flights: null,
        sites: null,
        gliders: null
    };

    this.loadingError = null;
};


DataService.prototype.getStoreContent = function(storeKey) {
    return this.store[storeKey];
};

DataService.prototype.getLoadingError = function() {
    return this.loadingError;
};


/**
 * Requests for all user data and populates store with it
 */
DataService.prototype.initiateStore = function() {
    AjaxService
        .get('/api/data', { lastModified: this.lastModified })
        .then(serverResponse => this.populateStore(serverResponse))
        .catch(error => this.setLoadingError(error));
};


/**
 * Logs out user
 * basically requests server to delete cookie since it couldn't be done from script
 */
DataService.prototype.logout = function() {
    AjaxService
        .post('/api/logout')
        .then(() => {
            this.clearStore();
            PubSub.emit('storeModified');
        })
        .catch(() => window.alert('Server error. Could not log out.'));
};


/**
 * Sends data to server
 * if success server responds with user data which was modified since lastModified
 * (in most cases should be only the data we send)
 * then populates store with new data
 * @param {Object} data
 * @param {string} dataType - one of 'flight', 'site', 'glider', 'pilot'
 * @returns {Promise} - whether request was successful
 */
DataService.prototype.saveData = function(data, dataType) {
    data = {
        data: data,
        dataType: dataType,
        lastModified: this.lastModified
    };

    return AjaxService
        .post('/api/data', data)
        .then(serverResponse => this.populateStore(serverResponse));
};


/**
 *
 * @param {Object} pilotCredentials
 *   @param {string} pilotCredentials.email
 *   @param {string} pilotCredentials.password
 *   @param {boolean} pilotCredentials.isSubscribed
 *
 * @returns {Promise} - whether request was successful
 */
DataService.prototype.createPilot = function(pilotCredentials) {
    return AjaxService
        .post('/api/signup', pilotCredentials)
        .then(newPilotInfo => {
            this.clearStore();
            this.addPilotInfo(newPilotInfo);
            this.initializeStore();
            PubSub.emit('storeModified');
        });
};


/**
 *
 * @param {Object} pilotCredentials
 *   @param {string} pilotCredentials.email
 *   @param {string} pilotCredentials.password
 *
 * @returns {Promise} - whether request was successful
 */
DataService.prototype.loginPilot = function(pilotCredentials) {
    // We are sending lastModified date along with user's credentials
    // in case if user was logged out due to expiring cookie and still has data in js
    // this saves amount of data sending between server and client
    var data = _.extend({}, pilotCredentials, { lastModified: this.lastModified });

    return AjaxService
        .post('/api/login', data)
        .then(serverResponse => this.populateStore(serverResponse));
};


/**
 *
 * @param {string} currentPassword
 * @param {string} nextPassword
 * @returns {Promise} - whether request was successful
 */
DataService.prototype.changePassword = function(currentPassword, nextPassword) {
    var passwords = {
        currentPassword: currentPassword,
        nextPassword: nextPassword
    };

    return AjaxService.post('/api/change-password', passwords);
};


DataService.prototype.sendVerificationEmail = function() {
    return AjaxService.post('/api/resend-auth-token');
};


DataService.prototype.sendOneTimeLoginEmail = function(email) {
    return AjaxService.post('/api/one-time-login', { email: email });
};


DataService.prototype.sendInitiateResetPasswordEmail = function(email) {
    return AjaxService.post('/api/initiate-reset-password', { email: email });
};


/**
 *
 * @param {string} nextPassword
 * @param {string} pilotId - taken from the url user got in his email
 * @param {string} authToken - taken from the url user got in his email
 * @returns {Promise} - whether request was successful
 */
DataService.prototype.resetPassword = function(nextPassword, pilotId, authToken) {
    var data = {
        password: nextPassword,
        pilotId: pilotId,
        authToken: authToken
    };

    return AjaxService
        .post('/api/reset-password', data)
        .then(serverResponse => this.populateStore(serverResponse));
};


/**
 * Once new user signed up we don't query the DB for his data (because he has none)
 * instead we just mimic empty store at front-end
 * store is null by default so models can distinguish between empty store and 'store is waiting for server response''
 */
DataService.prototype.initializeStore = function() {
    Object
        .keys(this.store)
        .forEach((key) => {
            if (key !== 'pilot' && this.store[key] === null) {
                this.store[key] = {};
            }
        });
};


/**
 * Once user logged out we clear all his data from the front-end store
 */
DataService.prototype.clearStore = function() {
    _.each(this.store, (value, key) => {
        this.store[key] = null;
    });
    this.lastModified = null;
    this.loadingError = null;
};


/**
 * Populates store with new data we got from the server
 * @param {Object} serverResponse
 */
DataService.prototype.populateStore =  function(serverResponse) {
    var isStoreModified = !!this.loadingError; // if store went from error to no-error, then it changed

    // If we got a valid response, there were no errors
    this.loadingError = null;

    // If we got new data, update front-end store
    if (this.lastModified === null ||
        this.lastModified < serverResponse.lastModified
    ) {
        this.lastModified = serverResponse.lastModified;
        this.initializeStore();

         _.each(serverResponse, (data, storeKey) => {
             if (storeKey === 'pilot') {
                 this.addPilotInfo(data);
                 return;
             }

             // if we have such data type update data
             if (this.store[storeKey] !== undefined) {
                 this.addItems(storeKey, data);
             }
         });

        isStoreModified = true;
    }

    if (isStoreModified) {
        PubSub.emit('storeModified');
    }
};


/**
 *
 * @param {Object} error
 */
DataService.prototype.setLoadingError = function(error) {
    // If server returns the same error we won't request for data again
    // and we won't emit StoreModified event, so view won't rerender the same error
    if (this.loadingError === null ||
        this.loadingError.type !== error.type
    ) {
        this.loadingError = error;
        // try to get data again
        this.initiateStore();
        PubSub.emit('storeModified');
    }
};


/**
 *
 * @param {Object} pilotInfo - pilot info object received from the server
 */
DataService.prototype.addPilotInfo = function(pilotInfo) {
    // If loading data the first time => create a store object
    // store is null by default so models can distinguish between empty store and 'store is waiting for server response''
    if (this.store.pilot === null) {
        this.store.pilot = {};
    }
    this.store.pilot = _.extend(this.store.pilot, pilotInfo);
};


/**
 * Add items which exist in server side but not in front-end
 * or delete items which were deleted in server side but not in front-end
 * @param {string} storeKey
 * @param {Object[]} newItems - received from the server
 */
DataService.prototype.addItems = function(storeKey, newItems) {
    newItems.forEach(item => {
        // If item is visible => update/add to the store object
        if (item.see) {
            this.store[storeKey][item.id] = item;
        // If item is deleted => remove it from data object
        } else if (this.store[storeKey][item.id]) {
            delete this.store[storeKey][item.id];
        }
    });
};



module.exports = new DataService();
