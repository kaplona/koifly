'use strict';

var _ = require('lodash');

var Altitude = require('../utils/altitude');
var ErrorTypes = require('../errors/error-types');
var KoiflyError = require('../errors/error');
var Util = require('../utils/util');

var dataService = require('../services/data-service');
var GliderModel = require('./glider');
var SiteModel = require('./site');


var FlightModel = {

    formValidationConfig: {
        date: {
            isRequired: true,
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

    /**
     * Prepare data to show to user
     * @returns {array|null|object} - array of flights
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getFlightsArray: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        return _.map(dataService.store.flights, (flight, flightId) => {
            return this.getFlightOutput(flightId);
        });
    },

    /**
     * Prepare data to show to user
     * @param {string} flightId
     * @returns {object|null} - flight
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getFlightOutput: function(flightId) {
        var loadingError = this.checkForLoadingErrors(flightId);
        if (loadingError !== false) {
            return loadingError;
        }

        // Get required flight from Data Service helper
        var flight = dataService.store.flights[flightId];

        var flightNumbers = this.getFlightNumbers(flight);
        
        return {
            id: flight.id,
            date: flight.date.substring(0, 10),
            flightNum: flightNumbers.flightNum,
            flightNumYear: flightNumbers.flightNumYear,
            flightNumDay: flightNumbers.flightNumDay,
            numOfFlightsThatDay: flightNumbers.numOfFlightsThatDay,
            siteId: flight.siteId,
            siteName: SiteModel.getSiteNameById(flight.siteId), // null if site doesn't exist,
            gliderName: GliderModel.getGliderNameById(flight.gliderId), // null if glider doesn't exist
            altitude: Altitude.getAltitudeInPilotUnits(flight.altitude),
            altitudeAboveLaunch: this.getAltitudeAboveLaunches(flight.siteId, flight.altitude),
            altitudeUnit: Altitude.getUserAltitudeUnit(),
            airtime: flight.airtime,
            remarks: flight.remarks
        };
    },

    /**
     * Prepare data to show to user
     * @param {number} flightId
     * @returns {object|null} - flight
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getFlightEditOutput: function(flightId) {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        if (flightId === undefined) {
            return this.getNewFlightOutput();
        }

        // Get required flight from Data Service helper
        var flight = dataService.store.flights[flightId];

        return {
            id: flight.id,
            date: flight.date.substring(0, 10),
            siteId: (flight.siteId === null) ? null : flight.siteId.toString(),
            altitude: Altitude.getAltitudeInPilotUnits(flight.altitude).toString(),
            altitudeUnit: Altitude.getUserAltitudeUnit(),
            gliderId: (flight.gliderId === null) ? null : flight.gliderId.toString(),
            hours: Math.floor(flight.airtime / 60).toString(),
            minutes: (flight.airtime % 60).toString(),
            remarks: flight.remarks
        };
    },

    /**
     * Prepare data to show to user
     * @returns {object|null} - flight
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getNewFlightOutput: function() {
        var lastFlight = this.getLastFlight();
        if (lastFlight === null) {
            // Take default flight properties
            lastFlight = {
                siteId: SiteModel.getLastAddedId(), // null if no data has been added yet
                gliderId: GliderModel.getLastAddedId() // null if no data has been added yet
            };
        }

        if (lastFlight.siteId) {
            var siteAltitude = SiteModel.getLaunchAltitudeById(lastFlight.siteId);
            siteAltitude = siteAltitude || 0;
        }

        return {
            date: Util.today(),
            // null if no sites yet otherwise last added site id
            siteId: (lastFlight.siteId === null) ? null : lastFlight.siteId.toString(),
            altitude: siteAltitude.toString(),
            altitudeUnit: Altitude.getUserAltitudeUnit(),
            // null if no sites yet otherwise last added glider id
            gliderId: (lastFlight.gliderId === null) ? null : lastFlight.gliderId.toString(),
            hours: '0',
            minutes: '0',
            remarks: ''
        };
    },

    /**
     * @param {number} flightId
     * @returns {false|null|object}
     * false - if no errors
     * null - if no errors but no data neither
     * error object - if error (either general error or record required by user doesn't exist)
     */
    checkForLoadingErrors: function(flightId) {
        // Check for loading errors
        if (dataService.loadingError !== null) {
            dataService.initiateStore();
            return { error: dataService.loadingError };
        // Check if data was loaded
        } else if (dataService.store.flights === null) {
            dataService.initiateStore();
            return null;
        // Check if required id exists
        } else if (flightId && dataService.store.flights[flightId] === undefined) {
            return { error: new KoiflyError(ErrorTypes.RECORD_NOT_FOUND) };
        }
        return false;
    },

    /**
     * Finds target flight number out of all flights, out of flights that year, out of flights that day
     * @param {Object} targetFlight
     * @returns {{
     *      flightNum: number,
     *      flightNumYear: number,
     *      flightNumDay: number,
     *      numOfFlightsThatDay: number
     *  }} - flight number, flight number for that year, flight number for that day, number of flights that day
     */
    getFlightNumbers: function(targetFlight) {
        var flightNumbers = {
            flightNum: 1,
            flightNumYear: 1,
            flightNumDay: 1,
            numOfFlightsThatDay: 1
        };

        _.each(dataService.store.flights, (flight, flightId) => {
            if (flightId === targetFlight.id.toString() ||
                flight.date.substring(0, 10) > targetFlight.date.substring(0, 10)
            ) {
                return;
            }

            if (flight.date.substring(0, 10) === targetFlight.date.substring(0, 10)) {
                flightNumbers.numOfFlightsThatDay ++;

                if (flight.createdAt < targetFlight.createdAt) {
                    flightNumbers.flightNum++;
                    flightNumbers.flightNumYear++;
                    flightNumbers.flightNumDay++;
                }
                return;
            }

            if (flight.date.substring(0, 4) === targetFlight.date.substring(0, 4)) {
                flightNumbers.flightNumYear ++;
            }

            flightNumbers.flightNum ++;
        });

        return flightNumbers;
    },

    /**
     * Searches for a flight with the largest flight number
     * if several flights were on the same date the latest will be the one which was created the last
     * @returns {object|null} - last flight or null if no flights yet
     */
    getLastFlight: function() {
        var lastFlight = null;

        _.each(dataService.store.flights, (flight) => {
            if (lastFlight === null ||
                flight.date > lastFlight.date ||
                (flight.date.substring(0, 10) === lastFlight.date.substring(0, 10) &&
                 flight.createdAt > lastFlight.createdAt)
            ) {
                lastFlight = flight;
            }
        });

        return lastFlight;
    },

    /**
     * @param {object} newFlight
     * @returns {Promise} - if saving was successful or not
     */
    saveFlight: function(newFlight) {
        newFlight = this.setFlightInput(newFlight);
        return dataService.saveFlight(newFlight);
    },

    /**
     * Fills empty fields with their defaults
     * takes only fields that should be send to the server
     * modifies some values how they should be stored in DB
     * @param {object} newFlight
     * @returns {object} - flight ready to send to the server
     */
    setFlightInput: function(newFlight) {
        // Set default values to empty fields
        newFlight = this.setDefaultValues(newFlight);

        // Create a flight only with fields which will be send to the server
        var flight = {
            id: newFlight.id,
            date: newFlight.date,
            siteId: (newFlight.siteId === null) ? null : parseInt(newFlight.siteId),
            gliderId: (newFlight.gliderId === null) ? null : parseInt(newFlight.gliderId),
            airtime: parseInt(newFlight.hours) * 60 + parseInt(newFlight.minutes),
            remarks: newFlight.remarks
        };

        var currentAltitude = (newFlight.id !== undefined) ? dataService.store.flights[newFlight.id].altitude : 0;
        var nextAltitude = parseInt(newFlight.altitude);
        var nextAltitudeUnit = newFlight.altitudeUnit;
        flight.altitude = Altitude.getAltitudeInMeters(nextAltitude, currentAltitude, nextAltitudeUnit);

        return flight;
    },

    /**
     * Walks through new flight and replace all empty values with default ones
     * @param {object} newFlight
     * @returns {object} - with replaced empty fields
     */
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

    /**
     * @param {number} flightId
     * @returns {Promise} - if deleting was successful or not
     */
    deleteFlight: function(flightId) {
        return dataService.saveFlight({ id: flightId, see: false });
    },


    /**
     * @param {number|null} siteId
     * @param {number} flightAltitude in meters
     * @returns {number} altitude above launch in pilot's altitude units
     */
    getAltitudeAboveLaunches: function(siteId, flightAltitude) {
        var siteAltitude = (siteId !== null) ? SiteModel.getLaunchAltitudeById(siteId) : 0;
        var altitudeDiff = parseFloat(flightAltitude) - parseFloat(siteAltitude);
        return Altitude.getAltitudeInPilotUnits(altitudeDiff);
    },

    /**
     * @returns {string|null} - date of the last flight or null if no flights yet
     */
    getLastFlightDate: function() {
        var lastFlight = this.getLastFlight();
        return (lastFlight !== null) ? lastFlight.date : null;
    },

    getNumberOfFlights: function() {
        return Object.keys(dataService.store.flights).length;
    },

    getNumberOfFlightsThisYear: function() {
        var date = new Date();
        var year = date.getFullYear();
        var numberOfFlights = 0;

        _.each(dataService.store.flights, (flight) => {
            if (flight.date.substring(0, 4) === year.toString()) {
                numberOfFlights++;
            }
        });

        return numberOfFlights;
    },

    /**
     * @param {number|string} gliderId
     * @returns {object} - number of flights for given glider recorded in App
     * keys: total, thisYear
     */
    getNumberOfFlightsOnGlider: function(gliderId) {
        gliderId = parseInt(gliderId);
        var date = new Date();
        var year = date.getFullYear();
        var numberOfFlights = {
            total: 0,
            thisYear: 0
        };
        _.each(dataService.store.flights, (flight) => {
            if (flight.gliderId === gliderId) {
                numberOfFlights.total++;

                if (flight.date.substring(0, 4) === year.toString()) {
                    numberOfFlights.thisYear++;
                }
            }
        });
        return numberOfFlights;
    },

    /**
     * @param {number|string} siteId
     * @returns {object} - number of flights at given site
     * keys: total, thisYear
     */
    getNumberOfFlightsAtSite: function(siteId) {
        siteId = parseInt(siteId);
        var date = new Date();
        var year = date.getFullYear();
        var numberOfFlights = {
            total: 0,
            thisYear: 0
        };
        _.each(dataService.store.flights, (flight) => {
            if (flight.siteId === siteId) {
                numberOfFlights.total++;

                if (flight.date.substring(0, 4) === year.toString()) {
                    numberOfFlights.thisYear++;
                }
            }
        });
        return numberOfFlights;
    },

    /**
     * @returns {number} - number of sites for which pilot has flight record in App
     */
    getNumberOfVisitedSites: function() {
        var sitesVisited = [];
        _.each(dataService.store.flights, (flight) => {
            if (flight.siteId !== null &&
                sitesVisited.indexOf(flight.siteId) === -1
            ) {
                sitesVisited.push(flight.siteId);
            }
        });
        return sitesVisited.length;
    },

    /**
     * @returns {number} - number of gliders which pilot used and has flight record in App
     */
    getNumberOfUsedGliders: function() {
        var glidersUsed = [];
        _.each(dataService.store.flights, (flight) => {
            if (flight.gliderId !== null &&
                glidersUsed.indexOf(flight.gliderId) === -1
            ) {
                glidersUsed.push(flight.gliderId);
            }
        });
        return glidersUsed.length;
    },

    /**
     * @returns {number} - airtime of all flights recorded in App
     */
    getTotalAirtime: function() {
        return _.sum(dataService.store.flights, 'airtime');
    },

    /**
     * @param {number|string} gliderId
     * @returns {number} - airtime for given glider recorded in App
     */
    getGliderAirtime: function(gliderId) {
        gliderId = parseInt(gliderId);
        return _.sum(dataService.store.flights, (flight) => {
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
