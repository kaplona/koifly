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
                url: '/api/signin',
                method: 'post',
                data: newPilot,
                onSuccess: () => {
                    this.setEmptyData();
                    resolve('success');
                },
                onFailure: reject
            });
        });
    },

    logInPilot: function(newPilot) {
        return new Promise((resolve, reject) => {
            ajaxService({
                url: '/api/login',
                method: 'post',
                data: newPilot,
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
            if (key !== 'loadingError') {
                this.data[key] = {};
            }
        });
        PubSub.emit('dataModified');
    },

    clearData: function() {
        // DEV
        console.log('clearing next data: ', this.data);

        _.each(this.data, (value, key) => {
            this.data[key] = null;
        });
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
            this.data.pilot.userName = newPilotInfo.userName;
            this.data.pilot.email = newPilotInfo.email;
        }
        this.data.pilot.initialFlightNum = newPilotInfo.initialFlightNum;
        this.data.pilot.initialAirtime = newPilotInfo.initialAirtime;
        this.data.pilot.altitudeUnit = newPilotInfo.altitudeUnit;
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
