'use strict';

var $ = require('jquery');
var _ = require('underscore');
var PubSub = require('../utils/pubsub');


var DataService = {

    lastModified: null,

    data: {
        pilot: null,
        flights: null,
        sites: null,
        gliders: null,
        error: null
    },

    loadData: function() {
        $.ajax({
                method: 'GET',
                url: '/api/data',
                context: this, // not sure if it will work
                dataType: 'json',
                data: { lastModified: JSON.stringify(this.lastModified) }
            })
            .done((msg) => {
                // DEV
                console.log('respond:', msg);

                this.setData(msg);
            });
    },

    sendData: function(data, dataType) {
        data = { lastModified: this.lastModified, data: JSON.stringify(data), dataType: dataType };
        console.log(data);
        $.ajax({
                method: 'POST',
                url: '/api/data',
                context: this,  // not sure if it will work
                dataType: 'json',
                data: data
            })
            .done((msg) => {
                // DEV
                console.log('respond:', msg);

                this.setData(msg);
            });
    },

    setData: function(serverData) {
        if (serverData.error || !serverData.lastModified) {
            // TODO error handling
            this.data.error = serverData;
            PubSub.emit('dataModified');
            return;
        }

        this.data.error = null;

        if (this.lastModified !== serverData.lastModified) {
            this.lastModified = serverData.lastModified;
             _.each(serverData, (data, dataType) => {
                 if (this.data[dataType] !== undefined) {
                     if (dataType === 'pilot') {
                         this.setPilotInfo(data);
                     } else {
                         this.setDataItems(data, dataType);
                     }
                 }
             }, this);
            console.log('inserted data', this.data);
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
        this.data.pilot.altitudeUnits = newPilotInfo.altitudeUnits;
    },

    setDataItems: function(newData, dataType) {
        if (newData.error) {
            // TODO error handling
            return;
        }
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

    // TODO send requests to server
    changePilotInfo: function(newPilotInfo) {
        this.sendData(newPilotInfo, 'pilot');
    },

    changeFlight: function(newFlight) {
        this.sendData(newFlight, 'flight');
    },

    changeSite: function(newSites) {
        this.sendData(newSites, 'site');
    },

    changeGlider: function(newGlider) {
        this.sendData(newGlider, 'glider');
    }
};



module.exports = DataService;
