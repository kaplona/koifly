'use strict';

var _ = require('lodash');
var ajaxService = require('./ajax-service');
var Promise = require('es6-promise').Promise;
var PubSub = require('../utils/pubsub');


var DataService = {

    lastModified: null,

    data: {
        pilot: null,
        flights: null,
        sites: null,
        gliders: null,
        loadingError: null
    },


    loadData: function() {
        ajaxService({
            url: '/api/data',
            method: 'get',
            params: { lastModified: this.lastModified },
            onSuccess: (serverResponse) => this.setData(serverResponse),
            onFailure: (serverResponse) => this.setError(serverResponse)
        });
    },


    logOut: function() {
        ajaxService({
            url: '/api/logout',
            method: 'post',
            onSuccess: () => this.clearData(),
            onFailure: () => window.alert('Server error. Could not log out.')
        });
    },


    sendData: function(data, dataType) {
        data = {
            lastModified: this.lastModified,
            data: data,
            dataType: dataType
        };

        return new Promise((resolve, reject) => {
            ajaxService({
                url: '/api/data',
                method: 'post',
                data: data,
                onSuccess: (serverResponse) => {
                    this.setData(serverResponse);
                    resolve('success');
                },
                onFailure: reject
            });
        });
    },


    createPilot: function(newPilot) {
        return new Promise((resolve, reject) => {
            ajaxService({
                url: '/api/signup',
                method: 'post',
                data: newPilot,
                onSuccess: (newPilotInfo) => {
                    this.setPilotInfo(newPilotInfo);
                    this.setEmptyData();
                    resolve('success');
                },
                onFailure: reject
            });
        });
    },

    loginPilot: function(newPilot) {
        return new Promise((resolve, reject) => {
            // We are sending lastModified date along with user's credentials
            // in case if user was logged out due to expiring cookie and still has data in js
            // this saves amount of data sending between server and client
            ajaxService({
                url: '/api/login',
                method: 'post',
                data: _.extend({}, newPilot, { lastModified: this.lastModified }),
                onSuccess: (serverResponse) => {
                    this.setData(serverResponse);
                    resolve('success');
                },
                onFailure: reject
            });
        });
    },

    changePass: function(passwords) {
        return new Promise((resolve, reject) => {
            ajaxService({
                url: '/api/change-pass',
                method: 'post',
                data: passwords,
                onSuccess: resolve,
                onFailure: reject
            });
        });
    },

    sendVerificationEmail: function(path, data) {
        path = path ? path : '/api/resend-token';
        return new Promise((resolve, reject) => {
            ajaxService({
                url: path,
                method: 'post',
                data: data,
                onSuccess: resolve,
                onFailure: reject
            });
        });
    },

    oneTimeLogin: function(email) {
        return this.sendVerificationEmail('/api/one-time-login', { email: email });
    },

    initiateResetPass: function(email) {
        return this.sendVerificationEmail('/api/initiate-reset-pass', { email: email });
    },

    resetPass: function(newPassword, pilotId, token) {
        return new Promise((resolve, reject) => {
            ajaxService({
                url: '/api/reset-pass',
                method: 'post',
                data: {
                    password: newPassword,
                    pilotId: pilotId,
                    token: token
                },
                onSuccess: (serverResponse) => {
                    this.setData(serverResponse);
                    resolve('success');
                },
                onFailure: reject
            });
        });
    },


    setEmptyData: function() {
        _.each(this.data, (value, key) => {
            if (key !== 'loadingError' && key !== 'pilot') {
                this.data[key] = {};
            }
        });
        PubSub.emit('dataModified');
    },

    clearData: function() {
        _.each(this.data, (value, key) => {
            this.data[key] = null;
        });
        this.lastModified = null;
        PubSub.emit('dataModified');
    },

    setData: function(serverResponse) {
        this.data.loadingError = null;
        if (this.lastModified === null ||
            this.lastModified < serverResponse.lastModified
        ) {
            this.lastModified = serverResponse.lastModified;
             _.each(serverResponse, (data, dataType) => {
                 if (this.data[dataType] !== undefined) {
                     if (dataType === 'pilot') {
                         this.setPilotInfo(data);
                     } else {
                         this.setDataItems(data, dataType);
                     }
                 }
             });
        }
        // DEV
        console.log('current data', this.data);

        PubSub.emit('dataModified');
    },

    setError: function(error) {
        if (this.data.loadingError === null ||
            this.data.loadingError.type !== error.type
        ) {
            this.data.loadingError = error;
            PubSub.emit('dataModified');
        }
    },

    setPilotInfo: function(newPilotInfo) {
        // If loading data the first time => create a data storage object
        if (this.data.pilot === null) {
            this.data.pilot = {};
            this.data.pilot.id = newPilotInfo.id;
        }
        this.data.pilot.userName = newPilotInfo.userName;
        this.data.pilot.initialFlightNum = newPilotInfo.initialFlightNum;
        this.data.pilot.initialAirtime = newPilotInfo.initialAirtime;
        this.data.pilot.altitudeUnit = newPilotInfo.altitudeUnit;
        this.data.pilot.isActivated = newPilotInfo.isActivated;
    },

    setDataItems: function(newData, dataType) {
        // If loading data the first time => create a data storage object
        if (this.data[dataType] === null) {
            this.data[dataType] = {};
        }
        for (var i = 0; i < newData.length; i++) {
            // If item is visible => update or add to the data object
            if (newData[i].see) {
                this.data[dataType][newData[i].id] = newData[i];
            // If item is deleted => remove it from data object
            } else if (this.data[dataType][newData[i].id]) {
                delete this.data[dataType][newData[i].id];
            }
        }
    },


    changePilotInfo: function(newPilotInfo) {
        return this.sendData(newPilotInfo, 'pilot');
    },

    changeFlight: function(newFlight) {
        return this.sendData(newFlight, 'flight');
    },

    changeSite: function(newSites) {
        return this.sendData(newSites, 'site');
    },

    changeGlider: function(newGlider) {
        return this.sendData(newGlider, 'glider');
    }
};


module.exports = DataService;
