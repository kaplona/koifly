'use strict';

var $ = require('jquery');
var _ = require('underscore');
var PubSub = require('../utils/pubsub');



//var newPilot = {
//    id: 1,
//    userName: 'Kaplun',
//    // password: 1111,
//    initialFlightNum: 10,
//    initialAirtime: 40,
//    altitudeUnits: 'feet'
//};
//
//var newFlights = {
//    34: {
//        id: 34,
//        date: '2015-05-13',
//        siteId: null, // default null
//        altitude: 670.56,
//        airtime: 14,
//        gliderId: 2, // default null
//        remarks: 'slide down',
//        creationDateTime: '2015-02-09 09:09:00',
//        see: 1
//
//    },
//    78: {
//        id: 78,
//        date: '2015-05-13',
//        siteId: 25,
//        altitude: 1859.28,
//        airtime: 34,
//        gliderId: 2,
//        remarks: 'first flight at Pemberton, thermal soaring',
//        creationDateTime: '2015-02-09 12:48:00',
//        see: 1
//
//    },
//    93: {
//        id: 93,
//        date: '2015-05-01',
//        siteId: 25,
//        altitude: 1249.68,
//        airtime: 14,
//        gliderId: 1,
//        remarks: 'ground suck',
//        creationDateTime: '2015-02-03 12:48:00',
//        see: 1
//
//    },
//    12: {
//        id: 12,
//        date: '2015-05-10',
//        siteId: 24,
//        altitude: 2834.64,
//        airtime: 94,
//        gliderId: 1,
//        remarks: 'Awesome flight: strong thermals, white snow caps and eagles!',
//        creationDateTime: '2015-02-04 12:48:00',
//        see: 1
//
//    }
//};
//
//var newSites = {
//    23: {
//        id: 23,
//        name: 'Hope',
//        location: 'Hope, BC, Canada',
//        coordinates: { lat: 49.368961, lng: -121.495056 },
//        launchAltitude: 0,
//        creationDateTime: '2015-02-04 12:48:00',
//        see: 1
//    },
//    24: {
//        id: 24,
//        name: 'Woodside',
//        location: 'Agazzis, BC, Canada',
//        coordinates: { lat: 49.2445, lng: -121.888504 },
//        launchAltitude: 670.56,
//        creationDateTime: '2015-05-24 12:48:00',
//        see: 1
//    },
//    25: {
//        id: 25,
//        name: 'Pemberton',
//        location: '',
//        coordinates: { lat: 50.369117, lng: -122.78698 },
//        launchAltitude: 1249.68,
//        creationDateTime: '2015-06-02 12:48:00',
//        see: 1
//    },
//    26: {
//        id: 26,
//        name: 'Blanchard',
//        location: 'Bellingham, WA, US',
//        coordinates: { lat: 48.652758, lng: -122.465115 },
//        launchAltitude: 548.7,
//        creationDateTime: '2015-02-04 14:19:00',
//        see: 1
//    }
//};
//
//var newGliders = {
//    1: {
//        id: 1,
//        name: 'Sport 2',
//        initialFlightNum: 4,
//        initialAirtime: 90,
//        remarks: 'need spare downtube',
//        creationDateTime: '2015-08-31 18:12:00',
//        see: 1
//    },
//    2: {
//        id: 2,
//        name: 'Pulse 9m',
//        initialFlightNum: 10,
//        initialAirtime: 120,
//        remarks: 'need after crash check',
//        creationDateTime: '2015-02-20 09:05:00',
//        see: 1
//    },
//    3: {
//        id: 3,
//        name: 'Falcon 14',
//        initialFlightNum: 23,
//        initialAirtime: 80,
//        remarks: '',
//        creationDateTime: '2015-06-04 12:48:00',
//        see: 1
//    }
//};


var DataService = {

    lastModified: null,

    data: {
        pilot: null,
        flights: null,
        sites: null,
        gliders: null
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
            return;
        }
        if (this.lastModified !== serverData.lastModified) {
            this.lastModified = serverData.lastModified;
             _.each(serverData, (value, key) => {
                 if (this.data[key] !== undefined) {
                     if (key === 'pilot') {
                         this.setPilotInfo(value);
                     } else {
                         this.setDataItems(value, key);
                     }
                 }
             }, this);
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
        for (var i = 0; i < newData.length; i++) {
            // If loading data the first time => create a data storage object
            if (this.data[dataType] === null) {
                this.data[dataType] = {};
            }
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
