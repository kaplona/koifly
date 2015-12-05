'use strict';

var $ = require('jquery');
var _ = require('underscore');
var Promise = require('es6-promise').Promise;
var PubSub = require('../utils/pubsub');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');


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
        $.ajax({
                method: 'GET',
                url: '/api/data',
                context: this,
                timeout: 3000,
                dataType: 'json',
                data: { lastModified: JSON.stringify(this.lastModified) }
            })
            .done((serverResponse) => {
                // DEV
                console.log('response:', serverResponse);

                if (serverResponse.error) {
                    this.setError(serverResponse.error);
                } else {
                    this.setData(serverResponse);
                }
            // If request failed or request time exceeded the timeout
            }).fail(() => {
                this.setError(new KoiflyError(ErrorTypes.CONNECTION_FAILURE));
            });
    },

    sendData: function(data, dataType) {
        data = {
            lastModified: this.lastModified,
            data: JSON.stringify(data),
            dataType: dataType
        };

        return new Promise((resolve, reject) => {
            $.ajax({
                    method: 'POST',
                    url: '/api/data',
                    timeout: 3000,
                    dataType: 'json',
                    data: data
                })
                .done((serverResponse) => {
                    // DEV
                    console.log('server response:', serverResponse);

                    if (serverResponse.error) {
                        reject(serverResponse.error);
                        return;
                    }

                    this.setData(serverResponse);
                    resolve('success');
                // If request failed or request time exceeded the timeout
                }).fail(() => {
                    reject(new KoiflyError(ErrorTypes.CONNECTION_FAILURE));
                });
        });
    },

    setData: function(serverResponse) {
        // DEV change '!==' to '<'
        console.log(this.lastModified, serverResponse.lastModified, this.lastModified < serverResponse.lastModified);

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
             }, this);

            // DEV
            console.log('current data', this.data);

            PubSub.emit('dataModified');
        }
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
                this.data[dataType][newData[i].id] = _.clone(newData[i]);
            // If item is deleted => remove it from data object
            } else if (this.data[dataType][newData[i].id] !== undefined) {
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
