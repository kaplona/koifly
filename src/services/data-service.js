'use strict';

var _ = require('lodash');
var ajaxService = require('./ajax-service');
var Promise = require('es6-promise').Promise;
var PubSub = require('../utils/pubsub');


var DataService = {

    lastModified: null,

    store: {
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
            onFailure: (error) => this.setError(error)
        });
    },


    logout: function() {
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
                    resolve(); // success
                },
                onFailure: reject
            });
        });
    },


    createPilot: function(pilotCredentials) {
        return new Promise((resolve, reject) => {
            ajaxService({
                url: '/api/signup',
                method: 'post',
                data: pilotCredentials,
                onSuccess: (newPilotInfo) => {
                    this.setPilotInfo(newPilotInfo);
                    this.setEmptyData();
                    resolve(); // success
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
                    resolve(); // success
                },
                onFailure: reject
            });
        });
    },

    changePassword: function(passwords) {
        return new Promise((resolve, reject) => {
            ajaxService({
                url: '/api/change-password',
                method: 'post',
                data: passwords,
                onSuccess: resolve,
                onFailure: reject
            });
        });
    },

    sendVerificationEmail: function(path, data) {
        path = path ? path : '/api/resend-auth-token';
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

    initiateResetPassword: function(email) {
        return this.sendVerificationEmail('/api/initiate-reset-password', { email: email });
    },

    resetPassword: function(newPassword, pilotId, authToken) {
        return new Promise((resolve, reject) => {
            ajaxService({
                url: '/api/reset-password',
                method: 'post',
                data: {
                    password: newPassword,
                    pilotId: pilotId,
                    authToken: authToken
                },
                onSuccess: (serverResponse) => {
                    this.setData(serverResponse);
                    resolve(); // success
                },
                onFailure: reject
            });
        });
    },


    setEmptyData: function() {
        _.each(this.store, (value, key) => {
            if (key !== 'loadingError' && key !== 'pilot') {
                this.store[key] = {};
            }
        });
        console.log('set empty data');
        PubSub.emit('dataModified');
    },

    clearData: function() {
        _.each(this.store, (value, key) => {
            this.store[key] = null;
        });
        this.lastModified = null;
        PubSub.emit('dataModified');
    },

    setData: function(serverResponse) {
        // If we got a valid response there were no errors
        this.store.loadingError = null;
        // If we got new data update front-end data
        if (this.lastModified === null ||
            this.lastModified < serverResponse.lastModified
        ) {
            //DEV
            console.log('data updating...');

            this.lastModified = serverResponse.lastModified;
             _.each(serverResponse, (data, dataType) => {
                 // if we have such data type update data
                 if (this.store[dataType] !== undefined) {
                     if (dataType === 'pilot') {
                         this.setPilotInfo(data);
                     } else {
                         this.setDataItems(data, dataType);
                     }
                 }
             });
            // Calculate and add some more fields to flights
            this.setFlightNumbers(serverResponse.flights);
        }
        // DEV
        console.log('current data', this.store);

        PubSub.emit('dataModified');
    },

    setError: function(error) {
        if (this.store.loadingError === null ||
            this.store.loadingError.type !== error.type
        ) {
            this.store.loadingError = error;
            PubSub.emit('dataModified');
        }
    },

    setPilotInfo: function(newPilotInfo) {
        // If loading data the first time => create a data storage object
        if (this.store.pilot === null) {
            this.store.pilot = {};
        }
        this.store.pilot = _.extend(this.store.pilot, newPilotInfo);
    },

    setDataItems: function(newData, dataType) {
        // If loading data the first time => create a data storage object
        if (this.store[dataType] === null) {
            this.store[dataType] = {};
        }
        for (var i = 0; i < newData.length; i++) {
            // If item is visible => update or add to the data object
            if (newData[i].see) {
                this.store[dataType][newData[i].id] = newData[i];
            // If item is deleted => remove it from data object
            } else if (this.store[dataType][newData[i].id]) {
                delete this.store[dataType][newData[i].id];
            }
        }
    },

    setFlightNumbers: function(newFlights) {
        // If no flights records yet or no new flights added
        if (_.isEmpty(this.store.flights) || _.isEmpty(newFlights)) {
            return null;
        }

        var sortedFlights = _.sortBy(this.store.flights, (flight) => {
            return [flight.date, flight.createdAt];
        });

        var flightId = null;
        var flightYear = null;
        var flightDay = null;
        var iteratedYear = null;
        var iteratedDay = null;
        var flightNumYear = 0;
        var flightNumDay = 0;
        for (var flightNum = 0; flightNum < sortedFlights.length; flightNum++) {
            flightId = sortedFlights[flightNum].id;

            // Add flight number field to this flight (+1 - array indexes start from 0)
            this.store.flights[flightId].flightNum = this.store.pilot.initialFlightNum + flightNum + 1;

            flightYear = sortedFlights[flightNum].date.substring(0, 4);
            if (iteratedYear !== flightYear) {
                iteratedYear = flightYear;
                flightNumYear = 0;
            }
            flightNumYear++;
            // Add year-flight-number field to this flight
            this.store.flights[flightId].flightNumYear = flightNumYear;

            flightDay = sortedFlights[flightNum].date.substring(0, 10);
            // if there was only one flight on previous day erase day-flight-number field of that flight
            if (iteratedDay !== flightDay && flightNumDay === 1) {
                var previousFlightId = sortedFlights[flightNum - 1].id;
                this.store.flights[previousFlightId].flightNumDay = null;
            }
            if (iteratedDay !== flightDay) {
                iteratedDay = flightDay;
                flightNumDay = 0;
            }
            flightNumDay++;
            // Add day-flight-number field to this flight
            this.store.flights[flightId].flightNumDay = flightNumDay;
        }
    },


    savePilotInfo: function(pilotInfo) {
        return this.sendData(pilotInfo, 'pilot');
    },

    saveFlight: function(flight) {
        return this.sendData(flight, 'flight');
    },

    saveSite: function(site) {
        return this.sendData(site, 'site');
    },

    saveGlider: function(glider) {
        return this.sendData(glider, 'glider');
    }
};


module.exports = DataService;
