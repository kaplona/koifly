'use strict';

var $ = require('jquery');
var _ = require('underscore');
var PubSub = require('./pubsub');
var DataService = require('../services/dataService');
var SiteModel = require('./site');
var GliderModel = require('./glider');
var PilotModel = require('./pilot');
var Util = require('./util');


var FlightModelConstructor = function() {

    this.formValidationConfig = {
        date: {
            method: 'dateFormat',
            rules: {
                field: 'Date'
            }
        },
        siteId: {
            method: 'selectOption',
            rules: {
                getArrayOfOptions: function() { return SiteModel.getSiteIdsList(); },
                defaultVal: null,
                field: 'Site'
            }
        },
        altitude: {
            method: 'number',
            rules: {
                min: 0,
                defaultVal: 0,
                field: 'Altitude'
            }
        },
        airtime: {
            method: 'number',
            rules: {
                min: 0,
                round: true,
                defaultVal: 0,
                field: 'Airtime'
            }
        },
        hours: {
            method: 'number',
            rules: {
                min: 0,
                round: true,
                defaultVal: 0,
                field: 'Airtime'
            }
        },
        minutes: {
            method: 'number',
            rules: {
                min: 0,
                round: true,
                defaultVal: 0,
                field: 'Airtime'
            }
        },
        gliderId: {
            method: 'selectOption',
            rules: {
                getArrayOfOptions: function() { return GliderModel.getGliderIdsList(); },
                defaultVal: null,
                field: 'Glider'
            }
        },
        remarks: {
            method: 'text',
            rules: {
                defaultVal: '',
                field: 'Remarks'
            }
        },
        altitudeUnits: {
            method: 'selectOption',
            rules: {
                getArrayOfOptions: function() { return PilotModel.getAltitudeUnitsList(); },
                field: 'Altitude Units'
            }
        }
    };

    this.getFlightsArray = function() {
        if (DataService.data.flights === null) {
            return null;
        }
        var flightOutputs = [];
        $.each(DataService.data.flights, (flightId) => flightOutputs.push(this.getFlightOutput(flightId)));
        return flightOutputs;
    };

    this.getFlightOutput = function(id) {
        if (DataService.data.flights === null) {
            return null;
        }
        if (DataService.data.flights[id] === undefined) {
            // TODO return error 'page not found'
            return false;
        }
        // If site is not defined for this flight show empty string to user instead
        var siteId = DataService.data.flights[id].siteId;
        var siteName = '';
        // If site is defined
        if (siteId !== null) {
            // Find site name to show to user
            siteName = SiteModel.getSiteNameById(siteId);
        }
        // If glider is not defined for this flight show empty string to user instead
        var gliderId = DataService.data.flights[id].gliderId;
        var gliderName = '';
        if (gliderId !== null) {
            gliderName = GliderModel.getGliderNameById(gliderId);
        }


        var altitude = PilotModel.getAltitudeInPilotUnits(DataService.data.flights[id].altitude);
        var altitudeUnits = PilotModel.getAltitudeUnits();
        var altitudeAboveLaunch = this.getAltitudeAboveLaunches(siteId, DataService.data.flights[id].altitude);
        return {
            id: id,
            date: DataService.data.flights[id].date,
            siteId: siteId, // ??? last added site or first site in alphabetic order !!! null if no sites yet
            siteName: siteName,
            altitude: altitude,
            altitudeUnits: altitudeUnits,
            altitudeAboveLaunch: altitudeAboveLaunch,
            airtime: DataService.data.flights[id].airtime,
            gliderId: gliderId, // ??? last added glider or first glider in alphabetic order !!! null if no sites yet
            gliderName: gliderName,
            remarks: DataService.data.flights[id].remarks
        };
    };

    this.getNewFlightOutput = function() {
        if (DataService.data.flights === null) {
            return null;
        }
        var lastFlight = this.getLastFlight();
        if (lastFlight === null) {
            // Take dafault flight properties
            lastFlight = {
                siteId: SiteModel.getLastAddedId(), // null if no data has been added yet
                gliderId: GliderModel.getLastAddedId() // null if no data has been added yet
            };
        }
        return {
            date: Util.today(),
            siteId: lastFlight.siteId, // null if no sites yet otherwise last added site id
            altitude: 0,
            altitudeUnits: PilotModel.getAltitudeUnits(),
            airtime: 0,
            gliderId: lastFlight.gliderId, // null if no sites yet otherwise last added glider id
            remarks: ''
        };
    };

    this.getLastFlight = function() {
        var noFlightsYet = true;
        var lastFlight = {};
        lastFlight.date = '1900-01-01'; // date to start from
        lastFlight.creationDateTime = '1900-01-01 00:00:00';

        $.each(DataService.data.flights, (flightId, flight) => {
            // Find the most recent date
            if (lastFlight.date < flight.date) {
                // Save this flight
                lastFlight = flight;
                // And Hurey, we have a flight record
                noFlightsYet = false;
            // If two flights was in the same day
            } else if (lastFlight.date === flight.date &&
                       lastFlight.creationDateTime < flight.creationDateTime
            ) {
                // Take the last created
                lastFlight = flight;
                noFlightsYet = false;
            }
        });

        return noFlightsYet ? null : lastFlight;
    };

    this.saveFlight = function(newFlight) {
        newFlight = this.setFlightInput(newFlight);
        DataService.changeFlights([ newFlight ]);
    };

    this.setFlightInput = function(newFlight) {
        // Set default values to empty fields
        newFlight = this.setDefaultValues(newFlight);

        var oldAltitude = (newFlight.id !== undefined) ? DataService.data.flights[newFlight.id].altitude : 0;
        var newAltitude = newFlight.altitude;
        var units = newFlight.altitudeUnits;
        newFlight.altitude = PilotModel.getAltitudeInMeters(newAltitude, oldAltitude, units);
        return newFlight;
    };

    this.setDefaultValues = function(newFlight) {
        $.each(this.formValidationConfig, (fieldName, config) => {
            // If there is default value for the field which val is null or empty string
            if ((newFlight[fieldName] === null || (newFlight[fieldName] + '').trim() === '') &&
                 config.rules.defaultVal !== undefined)
            {
                // Set it to its default value
                newFlight[fieldName] = config.rules.defaultVal;
            }
        });
        return newFlight;
    };

    this.deleteFlight = function(flightId) {
        DataService.changeFlights([ { id: flightId, see: 0 } ]);
    };

    // Expected eventData: { siteId: siteId }
    this.clearSiteId = function(eventData) {
        var flightsToChange = [];
        $.each(DataService.data.flights, (flightId, flight) => {
            if (flight.siteId === parseInt(eventData.siteId)) {
                flightsToChange.push(_.clone(flight));
                flightsToChange[flightsToChange.length - 1].siteId = null;
            }
        });
        DataService.changeFlights(flightsToChange);
    };

    // Expected eventData: { gliderId: gliderId }
    this.clearGliderId = function(eventData) {
        var flightsToChange = [];
        $.each(DataService.data.flights, (flightId, flight) => {
            if (flight.gliderId === parseInt(eventData.gliderId)) {
                flightsToChange.push(_.clone(flight));
                flightsToChange[flightsToChange.length - 1].gliderId = null;
            }
        });
        DataService.changeFlights(flightsToChange);
    };

    /**
     * Gets altitude above launch in pilot's altitude units
     * @param {number|null} siteId
     * @param {number} flightAltitude in meters
     * @returns {number} altitude above launch in pilot's altitude units
     */
    this.getAltitudeAboveLaunches = function(siteId, flightAltitude) {
        var siteAltitude = (siteId !== null) ? SiteModel.getLaunchAltitudeById(siteId) : 0;
        var altitudeDiff = parseFloat(flightAltitude) - parseFloat(siteAltitude);
        return PilotModel.getAltitudeInPilotUnits(altitudeDiff);
    };

    this.getLastFlightDate = function() {
        var lastFlight = this.getLastFlight();
        return (lastFlight !== null) ? lastFlight.date : null;
    };

    this.getNumberOfFlights = function() {
        return Object.keys(DataService.data.flights).length;
    };

    this.getNumberOfFlightsOnGlider = function(gliderId) {
        var numberOfFlights = 0;
        $.each(DataService.data.flights, (flightId, flight) => {
            if (flight.gliderId === parseInt(gliderId)) {
                numberOfFlights++;
            }
        });
        return numberOfFlights;
    };

    this.getNumberOfVisitedSites = function() {
        var sitesVisited = [];
        $.each(DataService.data.flights, (flightId, flight) => {
            if (flight.siteId !== null &&
                sitesVisited.indexOf(flight.siteId) === -1)
            {
                sitesVisited.push(flight.siteId);
            }
        });
        return sitesVisited.length;
    };

    this.getTotalAirtime = function() {
        var airtime = 0;
        $.each(DataService.data.flights, (flightId, flight) => {
            airtime += parseInt(flight.airtime);
        });
        return airtime;
    };

    this.getGliderAirtime = function(gliderId) {
        var gliderAirtime = 0;
        $.each(DataService.data.flights, (flightId, flight) => {
            if (flight.gliderId == gliderId) {
                gliderAirtime += parseFloat(flight.airtime);
            }
        });
        return gliderAirtime;
    };

    this.getValidationConfig = function() {
        return this.formValidationConfig;
    };


    PubSub.on('siteDeleted', this.clearSiteId, this);
    PubSub.on('gliderDeleted', this.clearGliderId, this);
};

FlightModelConstructor.prototype = Object.create(Object.prototype);
FlightModelConstructor.prototype.constructor = FlightModelConstructor;
var FlightModel = new FlightModelConstructor();


module.exports = FlightModel;
