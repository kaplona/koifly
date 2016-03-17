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


/**
 * Requests for all user data and populates store with it
 */
DataService.prototype.initiateStore = function() {
    AjaxService
        .get('/api/data', { lastModified: this.lastModified })
        .then((serverResponse) => {
            this.populateStore(serverResponse);
        })
        .catch((error) => {
            this.setLoadingError(error);
        });
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
        }).catch(() => {
            window.alert('Server error. Could not log out.');
        });
};


/**
 * Sends data to server
 * if success server responds with user data which was modified since lastModified
 * (in most cases should be only the data we send)
 * then populates store with new data
 * @param {Object} data
 * @param {string} dataType - one of 'flight', 'site', 'glider', 'pilot'
 * @returns {Promise} - if request was successful
 */
DataService.prototype.saveData = function(data, dataType) {
    data = {
        data: data,
        dataType: dataType,
        lastModified: this.lastModified
    };

    return AjaxService
        .post('/api/data', data)
        .then((serverResponse) => {
            this.populateStore(serverResponse);
        });
};


/**
 *
 * @param {Object} pilotCredentials
 * @param {string} pilotCredentials.email
 * @param {string} pilotCredentials.password
 * @param {boolean} pilotCredentials.isSubscribed
 *
 * @returns {Promise} - if request was successful
 */
DataService.prototype.createPilot = function(pilotCredentials) {
    return AjaxService
        .post('/api/signup', pilotCredentials)
        .then((newPilotInfo) => {
            this.setPilotInfo(newPilotInfo);
            this.setEmptyStore();
        });
};


/**
 *
 * @param {Object} pilotCredentials
 * @param {string} pilotCredentials.email
 * @param {string} pilotCredentials.password
 *
 * @returns {Promise} - if request was successful
 */
DataService.prototype.loginPilot = function(pilotCredentials) {
    // We are sending lastModified date along with user's credentials
    // in case if user was logged out due to expiring cookie and still has data in js
    // this saves amount of data sending between server and client
    var data = _.extend({}, pilotCredentials, { lastModified: this.lastModified });

    return AjaxService
        .post('/api/login', data)
        .then((serverResponse) => {
            this.populateStore(serverResponse);
        });
};


/**
 *
 * @param {string} currentPassword
 * @param {string} nextPassword
 * @returns {Promise} - if request was successful
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
 * @returns {Promise} - if request was successful
 */
DataService.prototype.resetPassword = function(nextPassword, pilotId, authToken) {
    var data = {
        password: nextPassword,
        pilotId: pilotId,
        authToken: authToken
    };

    return AjaxService
        .post('/api/reset-password', data)
        .then((serverResponse) => {
            this.populateStore(serverResponse);
        });
};


/**
 * Once new user signed up we don't query the DB for his data (because he has none)
 * instead we just mimic empty store at front-end
 */
DataService.prototype.setEmptyStore = function() {
    _.each(this.store, (value, key) => {
        if (key !== 'pilot') {
            this.store[key] = {};
        }
    });

    PubSub.emit('storeModified');
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

    PubSub.emit('storeModified');
};


/**
 * Populates store with new data we got from the server
 * @param {Object} serverResponse
 */
DataService.prototype.populateStore =  function(serverResponse) {
    // If we got a valid response there were no errors
    this.loadingError = null;

    // If we got new data update front-end store
    if (this.lastModified === null ||
        this.lastModified < serverResponse.lastModified
    ) {
        this.lastModified = serverResponse.lastModified;

         _.each(serverResponse, (data, storeKey) => {
             if (storeKey === 'pilot') {
                 this.setPilotInfo(data);
                 return;
             }

             // if we have such data type update data
             if (this.store[storeKey] !== undefined) {
                 this.setDataItems(data, storeKey);
             }
         });
    }
    // DEV
    console.log('current data', this.store);

    PubSub.emit('storeModified');
};


/**
 *
 * @param {Object} error
 */
DataService.prototype.setLoadingError = function(error) {
    if (this.loadingError === null ||
        this.loadingError.type !== error.type
    ) {
        this.loadingError = error;

        PubSub.emit('storeModified');
    }
};


/**
 *
 * @param {Object} pilotInfo - pilot info object received from the server
 */
DataService.prototype.setPilotInfo = function(pilotInfo) {
    // If loading data the first time => create a store object
    // store is null by default so models can distinguish between empty store and 'store is waiting for server response''
    if (this.store.pilot === null) {
        this.store.pilot = {};
    }
    this.store.pilot = _.extend(this.store.pilot, pilotInfo);
};


/**
 *
 * @param {Object} newData - received from the server
 * @param {string} storeKey
 */
DataService.prototype.setDataItems = function(newData, storeKey) {
    // If loading data the first time => create a data storage object
    // store is null by default so models can distinguish between empty store and 'store is waiting for server response''
    if (this.store[storeKey] === null) {
        this.store[storeKey] = {};
    }
    for (var i = 0; i < newData.length; i++) {
        // If item is visible => update/add to the store object
        if (newData[i].see) {
            this.store[storeKey][newData[i].id] = newData[i];
        // If item is deleted => remove it from data object
        } else if (this.store[storeKey][newData[i].id]) {
            delete this.store[storeKey][newData[i].id];
        }
    }
};


DataService.prototype.savePilotInfo = function(pilotInfo) {
    return this.saveData(pilotInfo, 'pilot');
};

DataService.prototype.saveItem = function(flight) {
    return this.saveData(flight, 'flight');
};

DataService.prototype.saveSite = function(site) {
    return this.saveData(site, 'site');
};

DataService.prototype.saveGlider = function(glider) {
    return this.saveData(glider, 'glider');
};



module.exports = new DataService();
