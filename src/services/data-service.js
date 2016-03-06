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
        console.log('set empty data');
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
        // If we got a valid response there were no errors
        this.data.loadingError = null;
        // If we got new data update front-end data
        if (this.lastModified === null ||
            this.lastModified < serverResponse.lastModified
        ) {
            //DEV
            console.log('data updating...');

            this.lastModified = serverResponse.lastModified;
             _.each(serverResponse, (data, dataType) => {
                 // if we have such data type update data
                 if (this.data[dataType] !== undefined) {
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
        }
        this.data.pilot = _.extend(this.data.pilot, newPilotInfo);
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

    setFlightNumbers: function(newFlights) {
        // If no flights records yet or no new flights added
        if (_.isEmpty(this.data.flights) || _.isEmpty(newFlights)) {
            return null;
        }

        var sortedFlights = _.sortBy(this.data.flights, (flight) => {
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
            this.data.flights[flightId].flightNum = this.data.pilot.initialFlightNum + flightNum + 1;

            flightYear = sortedFlights[flightNum].date.substring(0, 4);
            if (iteratedYear !== flightYear) {
                iteratedYear = flightYear;
                flightNumYear = 0;
            }
            flightNumYear++;
            // Add year-flight-number field to this flight
            this.data.flights[flightId].flightNumYear = flightNumYear;

            flightDay = sortedFlights[flightNum].date.substring(0, 10);
            // if there was only one flight on previous day erase day-flight-number field of that flight
            if (iteratedDay !== flightDay && flightNumDay === 1) {
                var previousFlightId = sortedFlights[flightNum - 1].id;
                this.data.flights[previousFlightId].flightNumDay = null;
            }
            if (iteratedDay !== flightDay) {
                iteratedDay = flightDay;
                flightNumDay = 0;
            }
            flightNumDay++;
            // Add day-flight-number field to this flight
            this.data.flights[flightId].flightNumDay = flightNumDay;
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
