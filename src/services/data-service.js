'use strict';

var $ = require('jquery');
var _ = require('underscore');
var PubSub = require('../utils/pubsub');
var Util = require('../utils/util');



var newPilot = {
    id: 3567,
    userName: 'Kaplun',
    // password: 1111,
    initialFlightNum: 10,
    initialAirtime: 40,
    altitudeUnits: 'feet'
};

var newFlights = {
    34: {
        id: 34,
        date: '2015-05-13',
        siteId: null, // default null
        altitude: 670.56,
        airtime: 14,
        gliderId: 2, // default null
        remarks: 'slide down',
        creationDateTime: '2015-02-09 09:09:00',
        see: 1

    },
    78: {
        id: 78,
        date: '2015-05-13',
        siteId: 25,
        altitude: 1859.28,
        airtime: 34,
        gliderId: 2,
        remarks: 'first flight at Pemberton, thermal soaring',
        creationDateTime: '2015-02-09 12:48:00',
        see: 1

    },
    93: {
        id: 93,
        date: '2015-05-01',
        siteId: 25,
        altitude: 1249.68,
        airtime: 14,
        gliderId: 1,
        remarks: 'ground suck',
        creationDateTime: '2015-02-03 12:48:00',
        see: 1

    },
    12: {
        id: 12,
        date: '2015-05-10',
        siteId: 24,
        altitude: 2834.64,
        airtime: 94,
        gliderId: 1,
        remarks: 'Awesome flight: strong thermals, white snow caps and eagles!',
        creationDateTime: '2015-02-04 12:48:00',
        see: 1

    }
};

var newSites = {
    23: {
        id: 23,
        name: 'Hope',
        location: 'Hope, BC, Canada',
        coordinates: { lat: 49.368961, lng: -121.495056 },
        launchAltitude: 0,
        creationDateTime: '2015-02-04 12:48:00',
        see: 1
    },
    24: {
        id: 24,
        name: 'Woodside',
        location: 'Agazzis, BC, Canada',
        coordinates: { lat: 49.2445, lng: -121.888504 },
        launchAltitude: 670.56,
        creationDateTime: '2015-05-24 12:48:00',
        see: 1
    },
    25: {
        id: 25,
        name: 'Pemberton',
        location: '',
        coordinates: { lat: 50.369117, lng: -122.78698 },
        launchAltitude: 1249.68,
        creationDateTime: '2015-06-02 12:48:00',
        see: 1
    },
    26: {
        id: 26,
        name: 'Blanchard',
        location: 'Bellingham, WA, US',
        coordinates: { lat: 48.652758, lng: -122.465115 },
        launchAltitude: 548.7,
        creationDateTime: '2015-02-04 14:19:00',
        see: 1
    }
};

var newGliders = {
    1: {
        id: 1,
        name: 'Sport 2',
        initialFlightNum: 4,
        initialAirtime: 90,
        remarks: 'need spare downtube',
        creationDateTime: '2015-08-31 18:12:00',
        see: 1
    },
    2: {
        id: 2,
        name: 'Pulse 9m',
        initialFlightNum: 10,
        initialAirtime: 120,
        remarks: 'need after crash check',
        creationDateTime: '2015-02-20 09:05:00',
        see: 1
    },
    3: {
        id: 3,
        name: 'Falcon 14',
        initialFlightNum: 23,
        initialAirtime: 80,
        remarks: '',
        creationDateTime: '2015-06-04 12:48:00',
        see: 1
    }
};


var DataService = {

    lastModified: null,

    data: {
        pilot: null,
        flights: null,
        sites: null,
        gliders: null
    },

    loadData: function() {
        var data = [
            { first: 'inside', second: 'out' },
            { first: 'despicable', second: 'me' }
        ];

        $.ajax({
                method: 'GET',
                url: '/test',
                data: { lastModified: 1111111, data: data }
            })
            .done((msg) => {
                console.log('respond: ' + msg);
            });
    },

    // TODO data should be modifies from server respond
    setData: function() {
        // TODO check this.last modified
        this.setPilot();
        this.setFlights();
        this.setSites();
        this.setGliders();
        PubSub.emit('dataModified');
    },

    setPilot: function() {
        this.data.pilot = _.clone(newPilot);
    },

    setFlights: function() {
        // TODO walk through each flight and replace it with new data if id matches
        this.data.flights = _.clone(newFlights);
    },

    setSites: function() {
        this.data.sites = _.clone(newSites);
    },

    setGliders: function() {
        this.data.gliders = _.clone(newGliders);
    },

    // TODO send requests to server
    changePilotInfo: function(pilotInfoToChange) {
        newPilot.initialFlightNum = pilotInfoToChange.initialFlightNum;
        newPilot.initialAirtime = pilotInfoToChange.initialAirtime;
        newPilot.altitudeUnits = pilotInfoToChange.altitudeUnits;
        this.setData();
    },

    changeFlights: function(flightsToChange) {
        this.changeData(flightsToChange, newFlights);
    },

    changeSites: function(sitesToChange) {
        this.changeData(sitesToChange, newSites);
    },

    changeGliders: function(glidersToChange) {
        this.changeData(glidersToChange, newGliders);
    },

    changeData: function(dataToChange, source) {
        for (var i = 0; i < dataToChange.length; i++) {
            var itemId = dataToChange[i].id;
            // TODO creationDateTime ('dateModified') will be set on server
            dataToChange[i].creationDateTime = Util.today() + ' ' + Util.timeNow();
            if (itemId === undefined) {
                var newId = 'tempId' + Date.now();
                dataToChange[i].id = newId;
                source[newId] = _.clone(dataToChange[i]);
            }
            if (source[itemId] === undefined) {
                continue;
            }
            if (dataToChange[i].see !== 0) {
                source[itemId] = _.clone(dataToChange[i]);
                continue;
            }
            delete source[itemId];
        }
        this.setData();
    }
};



//window.setTimeout(DataService.setData, 3000);
DataService.setData();

module.exports = DataService;
