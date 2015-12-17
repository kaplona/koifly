'use strict';

var _ = require('lodash');
var Promise = require('es6-promise').Promise;
var PubSub = require('../utils/pubsub');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');


var timeout = 3000;


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
        var url = '/api/data';
        var params = 'lastModified=' + JSON.stringify(this.lastModified);
        var ajaxRequest = new XMLHttpRequest();
        ajaxRequest.timeout = timeout;

        ajaxRequest.addEventListener('load', () => {
            if (ajaxRequest.status === 401) {
                this.setError(new KoiflyError(ErrorTypes.AUTHENTICATION_FAILURE));
                return;
            }

            if (ajaxRequest.status >= 400 && ajaxRequest.status < 500) {
                this.setError(new KoiflyError(ErrorTypes.CONNECTION_FAILURE));
                return;
            }

            var serverResponse = JSON.parse(ajaxRequest.responseText);

            // DEV
            console.log('server get response: ', serverResponse);

            if (serverResponse.error) {
                this.setError(serverResponse.error);
                return;
            }

            this.setData(serverResponse);
        });

        ajaxRequest.addEventListener('error', () => {
            this.setError(new KoiflyError(ErrorTypes.CONNECTION_FAILURE));
        });
        ajaxRequest.addEventListener('timeout', () => {
            this.setError(new KoiflyError(ErrorTypes.CONNECTION_FAILURE));
        });

        ajaxRequest.open('GET', url + '?' + params);
        ajaxRequest.send();
    },


    logOut: function() {
        var ajaxRequest = new XMLHttpRequest();
        ajaxRequest.addEventListener('load', () => {
            if (ajaxRequest.status >= 400 && ajaxRequest.status < 500) {
                window.alert('Server error. Could not log out.');
                return;
            }
            this.clearData();
        });
        ajaxRequest.addEventListener('error', () => {
            window.alert('Server error. Could not log out.');
        });
        ajaxRequest.addEventListener('timeout', () => {
            window.alert('Server error. Could not log out.');
        });
        ajaxRequest.open('post', '/api/logout');
        ajaxRequest.send();
    },


    sendData: function(data, dataType) {
        data = {
            lastModified: this.lastModified,
            data: data,
            dataType: dataType
        };

        return new Promise((resolve, reject) => {
            var ajaxRequest = new XMLHttpRequest();
            ajaxRequest.timeout = timeout;

            ajaxRequest.addEventListener('load', () => {
                if (ajaxRequest.status === 401) {
                    reject(new KoiflyError(ErrorTypes.AUTHENTICATION_FAILURE));
                    return;
                }

                if (ajaxRequest.status >= 400 && ajaxRequest.status < 500) {
                    reject(new KoiflyError(ErrorTypes.CONNECTION_FAILURE));
                    return;
                }

                var serverResponse = JSON.parse(ajaxRequest.responseText);

                // DEV
                console.log('server post response:', serverResponse);

                if (serverResponse.error) {
                    reject(serverResponse.error);
                    return;
                }

                this.setData(serverResponse);
                resolve('success');
            });

            ajaxRequest.addEventListener('error', () => {
                reject(new KoiflyError(ErrorTypes.CONNECTION_FAILURE));
            });
            ajaxRequest.addEventListener('timeout', () => {
                reject(new KoiflyError(ErrorTypes.CONNECTION_FAILURE));
            });

            ajaxRequest.open('post', '/api/data');
            ajaxRequest.send(JSON.stringify(data));
        });
    },


    createPilot: function(newPilot) {
        return new Promise((resolve, reject) => {
            var ajaxRequest = new XMLHttpRequest();
            ajaxRequest.timeout = timeout;

            ajaxRequest.addEventListener('load', () => {
                if (ajaxRequest.status >= 400 && ajaxRequest.status < 500) {
                    reject(new KoiflyError(ErrorTypes.CONNECTION_FAILURE));
                    return;
                }

                // DEV
                console.log('sign in response:', ajaxRequest.responseText);

                // there is no responseText on successful request
                if (ajaxRequest.responseText && JSON.parse(ajaxRequest.responseText).error) {
                    reject(JSON.parse(ajaxRequest.responseText).error);
                    return;
                }

                this.setEmptyData();
                resolve('success');
            });

            ajaxRequest.addEventListener('error', () => {
                console.log('ajax error');
                reject(new KoiflyError(ErrorTypes.CONNECTION_FAILURE));
            });
            ajaxRequest.addEventListener('timeout', () => {
                console.log('timeout error');
                reject(new KoiflyError(ErrorTypes.CONNECTION_FAILURE));
            });

            ajaxRequest.open('post', '/api/signin');
            ajaxRequest.send(JSON.stringify(newPilot));
        });
    },

    logInPilot: function(newPilot) {
        return new Promise((resolve, reject) => {
            var ajaxRequest = new XMLHttpRequest();
            ajaxRequest.timeout = timeout;

            ajaxRequest.addEventListener('load', () => {
                if (ajaxRequest.status >= 400 && ajaxRequest.status < 500) {
                    reject(new KoiflyError(ErrorTypes.CONNECTION_FAILURE));
                    return;
                }

                var serverResponse = JSON.parse(ajaxRequest.responseText);

                // DEV
                console.log('log in response:', ajaxRequest.responseText);

                if (serverResponse.error) {
                    reject(serverResponse.error);
                    return;
                }

                this.setData(serverResponse);
                resolve('success');
            });

            ajaxRequest.addEventListener('error', () => {
                console.log('ajax error');
                reject(new KoiflyError(ErrorTypes.CONNECTION_FAILURE));
            });
            ajaxRequest.addEventListener('timeout', () => {
                console.log('timeout error');
                reject(new KoiflyError(ErrorTypes.CONNECTION_FAILURE));
            });

            ajaxRequest.open('post', '/api/login');
            ajaxRequest.send(JSON.stringify(newPilot));
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
