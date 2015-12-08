'use strict';

var _ = require('lodash');
var DataService = require('../services/data-service');
var SiteModel = require('./site');
var GliderModel = require('./glider');
var Util = require('../utils/util');
var Altitude = require('../utils/altitude');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');


var FlightModel = {

    formValidationConfig: {
        date: {
            isRequired: true, // TODO
            method: 'date',
            rules: {
                field: 'Date'
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
        remarks: {
            method: 'text',
            rules: {
                defaultVal: '',
                maxLength: 10000,
                field: 'Remarks'
            }
        }
    },

    getFlightsArray: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        return _.map(DataService.data.flights, (flight, flightId) => {
            return this.getFlightOutput(flightId);
        });
    },

    getFlightOutput: function(flightId) {
        var loadingError = this.checkForLoadingErrors(flightId);
        if (loadingError !== false) {
            return loadingError;
        }

        // Get required flight from Data Service helper
        var flight = DataService.data.flights[flightId];

        var date = flight.date.substring(0, 10);
        var siteName = SiteModel.getSiteNameById(flight.siteId); // null if site doesn't exist
        var gliderName = GliderModel.getGliderNameById(flight.gliderId); // null if glider doesn't exist
        var altitude = Altitude.getAltitudeInPilotUnits(flight.altitude);
        var altitudeAboveLaunch = this.getAltitudeAboveLaunches(flight.siteId, flight.altitude);
        var altitudeUnit = Altitude.getUserAltitudeUnit();

        return {
            id: flightId,
            date: date,
            siteId: flight.siteId,
            siteName: siteName,
            gliderName: gliderName,
            altitude: altitude,
            altitudeAboveLaunch: altitudeAboveLaunch,
            altitudeUnit: altitudeUnit,
            airtime: flight.airtime,
            remarks: flight.remarks
        };
    },

    getFlightEditOutput: function(flightId) {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        if (flightId === undefined) {
            return this.getNewFlightOutput();
        }

        // Get required flight from Data Service helper
        var flight = DataService.data.flights[flightId];

        var date = flight.date.substring(0, 10);
        var altitude = Altitude.getAltitudeInPilotUnits(flight.altitude);
        var altitudeUnit = Altitude.getUserAltitudeUnit();
        var hours = Math.floor(flight.airtime / 60);
        var minutes = flight.airtime % 60;

        return {
            id: flightId,
            date: date,
            siteId: flight.siteId,
            altitude: altitude,
            altitudeUnit: altitudeUnit,
            airtime: flight.airtime,
            hours: hours,
            minutes: minutes,
            gliderId: flight.gliderId,
            remarks: flight.remarks
        };
    },

    getNewFlightOutput: function() {
        var lastFlight = this.getLastFlight();
        if (lastFlight === null) {
            // Take default flight properties
            lastFlight = {
                siteId: SiteModel.getLastAddedId(), // null if no data has been added yet
                gliderId: GliderModel.getLastAddedId() // null if no data has been added yet
            };
        }
        return {
            date: Util.today(),
            siteId: lastFlight.siteId, // null if no sites yet otherwise last added site id
            altitude: 0,
            altitudeUnit: Altitude.getUserAltitudeUnit(),
            airtime: 0,
            hours: 0,
            minutes: 0,
            gliderId: lastFlight.gliderId, // null if no sites yet otherwise last added glider id
            remarks: ''
        };
    },

    checkForLoadingErrors: function(flightId) {
        // Check for loading errors
        if (DataService.data.loadingError !== null) {
            DataService.loadData();
            return { error: DataService.data.loadingError };
        // Check if data was loaded
        } else if (DataService.data.flights === null) {
            DataService.loadData();
            return null;
        // Check if required id exists
        } else if (flightId && DataService.data.flights[flightId] === undefined) {
            return { error: new KoiflyError(ErrorTypes.NO_EXISTENT_RECORD) };
        }
        return false;
    },

    getLastFlight: function() {
        var noFlightsYet = true;
        var lastFlight = {};
        lastFlight.date = '1900-01-01'; // date to start from
        lastFlight.createdAt = '1900-01-01 00:00:00';

        _.each(DataService.data.flights, (flight) => {
            // Find the most recent date
            if (lastFlight.date < flight.date) {
                // Save this flight
                lastFlight = flight;
                // And Hurey, we have a flight record
                noFlightsYet = false;
            // If two flights was in the same day
            } else if (lastFlight.date === flight.date &&
                       lastFlight.createdAt < flight.createdAt
            ) {
                // Take the last created
                lastFlight = flight;
                noFlightsYet = false;
            }
        });

        return noFlightsYet ? null : lastFlight;
    },

    saveFlight: function(newFlight) {
        newFlight = this.setFlightInput(newFlight);
        return DataService.changeFlight(newFlight);
    },

    setFlightInput: function(newFlight) {
        // Set default values to empty fields
        newFlight = this.setDefaultValues(newFlight);

        // Create a flight only with fields which will be send to the server
        var flight = {};
        flight.id = newFlight.id;
        flight.date = newFlight.date;
        flight.siteId = newFlight.siteId;
        flight.gliderId = newFlight.gliderId;
        flight.airtime = parseInt(newFlight.hours) * 60 + parseInt(newFlight.minutes);
        flight.remarks = newFlight.remarks;

        var oldAltitude = (newFlight.id !== undefined) ? DataService.data.flights[newFlight.id].altitude : 0;
        var newAltitude = newFlight.altitude;
        var newAltitudeUnit = newFlight.altitudeUnit;
        flight.altitude = Altitude.getAltitudeInMeters(newAltitude, oldAltitude, newAltitudeUnit);

        return flight;
    },

    setDefaultValues: function(newFlight) {
        var fieldsToReplace = {};
        _.each(this.formValidationConfig, (config, fieldName) => {
            // If there is default value for the field which val is null or undefined or empty string
            if ((newFlight[fieldName] === null ||
                 newFlight[fieldName] === undefined ||
                (newFlight[fieldName] + '').trim() === '') &&
                 config.rules.defaultVal !== undefined
            ) {
                // Set it to its default value
                fieldsToReplace[fieldName] = config.rules.defaultVal;
            }
        });
        return _.extend({}, newFlight, fieldsToReplace);
    },

    deleteFlight: function(flightId) {
        return DataService.changeFlight({ id: flightId, see: 0 });
    },


    /**
     * Gets altitude above launch in pilot's altitude units
     * @param {number|null} siteId
     * @param {number} flightAltitude in meters
     * @returns {number} altitude above launch in pilot's altitude units
     */
    getAltitudeAboveLaunches: function(siteId, flightAltitude) {
        var siteAltitude = (siteId !== null) ? SiteModel.getLaunchAltitudeById(siteId) : 0;
        var altitudeDiff = parseFloat(flightAltitude) - parseFloat(siteAltitude);
        return Altitude.getAltitudeInPilotUnits(altitudeDiff);
    },

    getLastFlightDate: function() {
        var lastFlight = this.getLastFlight();
        return (lastFlight !== null) ? lastFlight.date : null;
    },

    getNumberOfFlights: function() {
        return Object.keys(DataService.data.flights).length;
    },

    getNumberOfFlightsOnGlider: function(gliderId) {
        gliderId = parseInt(gliderId);
        var numberOfFlights = 0;
        _.each(DataService.data.flights, (flight) => {
            if (flight.gliderId === gliderId) {
                numberOfFlights++;
            }
        });
        return numberOfFlights;
    },

    getNumberOfVisitedSites: function() {
        var sitesVisited = [];
        _.each(DataService.data.flights, (flight) => {
            if (flight.siteId !== null &&
                sitesVisited.indexOf(flight.siteId) === -1
            ) {
                sitesVisited.push(flight.siteId);
            }
        });
        return sitesVisited.length;
    },

    getTotalAirtime: function() {
        return _.sum(DataService.data.flights, 'airtime');
    },

    getGliderAirtime: function(gliderId) {
        gliderId = parseInt(gliderId);
        return _.sum(DataService.data.flights, (flight) => {
            if (flight.gliderId === gliderId) {
                return flight.airtime;
            }
        });
    },

    getValidationConfig: function() {
        return this.formValidationConfig;
    }
};


module.exports = FlightModel;
