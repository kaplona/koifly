'use strict';

var _ = require('lodash');
var objectValues = require('object.values');

var Altitude = require('../utils/altitude');
var Util = require('../utils/util');

var BaseModel = require('./base-model');
var GliderModel = require('./glider');
var SiteModel = require('./site');


var FlightModel = {
    
    keys: {
        single: 'flight',
        plural: 'flights'
    },

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
    getListOutput: function() {
        var storeContent = this.getStoreContent();
        if (!storeContent || storeContent.error) {
            return storeContent;
        }

        return objectValues(storeContent).map(flight => {
            return {
                id: flight.id,
                date: flight.date.substring(0, 10),
                siteName: flight.siteId ? SiteModel.getSiteName(flight.siteId) : null,
                altitude: Altitude.getAltitudeInPilotUnits(flight.altitude),
                airtime: flight.airtime
            };
        });
    },
    

    /**
     * Prepare data to show to user
     * @param {string|number} flightId
     * @returns {object|null} - flight
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     * or there is no flight with such id
     */
    getItemOutput: function(flightId) {
        var flight = this.getStoreContent(flightId);
        if (!flight || flight.error) {
            return flight;
        }

        var flightNumbers = this.getFlightNumbers(flight);
        
        return {
            id: flight.id,
            date: flight.date.substring(0, 10),
            flightNum: flightNumbers.flightNum,
            flightNumYear: flightNumbers.flightNumYear,
            flightNumDay: flightNumbers.flightNumDay,
            numOfFlightsThatDay: flightNumbers.numOfFlightsThatDay,
            siteId: flight.siteId,
            siteName: flight.siteId ? SiteModel.getSiteName(flight.siteId) : null,
            gliderName: flight.gliderId ? GliderModel.getGliderName(flight.gliderId) : null,
            altitude: Altitude.getAltitudeInPilotUnits(flight.altitude),
            altitudeAboveLaunch: this.getAltitudeAboveLaunch(flight.siteId, flight.altitude),
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
     * or there is no flight with such id
     */
    getEditOutput: function(flightId) {
        if (!flightId) {
            return this.getNewItemOutput();
        }

        var flight = this.getStoreContent(flightId);
        if (!flight || flight.error) {
            return flight;
        }

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
    getNewItemOutput: function() {
        var storeContent = this.getStoreContent();
        if (!storeContent || storeContent.error) {
            return storeContent;
        }

        var siteAltitude;
        var lastFlight = this.getLastFlight();
        if (lastFlight === null) {
            // Take default flight properties
            lastFlight = {
                siteId: SiteModel.getLastAddedId(), // null if no data has been added yet
                gliderId: GliderModel.getLastAddedId() // null if no data has been added yet
            };
        }

        if (lastFlight.siteId) {
            siteAltitude = SiteModel.getLaunchAltitude(lastFlight.siteId);
        }
        siteAltitude = siteAltitude || 0;

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
     * Fills empty fields with their defaults
     * takes only fields that should be send to the server
     * modifies some values how they should be stored in DB
     * @param {object} newFlight
     * @returns {object} - flight ready to send to the server
     */
    getDataForServer: function(newFlight) {
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

        var currentAltitude = (newFlight.id !== undefined) ? this.getStoreContent(newFlight.id).altitude : 0;
        var nextAltitude = parseInt(newFlight.altitude);
        var nextAltitudeUnit = newFlight.altitudeUnit;
        flight.altitude = Altitude.getAltitudeInMeters(nextAltitude, currentAltitude, nextAltitudeUnit);

        return flight;
    },


    /**
     * Searches for a flight with the latest date
     * if several flights were on the same date the latest will be the one which was created the last
     * @returns {object|null} - last flight or null if no flights yet
     */
    getLastFlight: function() {
        var lastFlight = null;

        objectValues(this.getStoreContent()).forEach(flight => {
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

        objectValues(this.getStoreContent()).forEach((flight, flightId) => {
            // Don't increment anything if it's our target flight or it was performed after our target flight
            if (flightId === targetFlight.id.toString() ||
                flight.date.substring(0, 10) > targetFlight.date.substring(0, 10)
            ) {
                return;
            }

            // If two flights took place on the same date
            // increment counters only if it's record was created prior to our target flight
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
     * @param {number|null} siteId
     * @param {number} flightAltitude in meters
     * @returns {number} altitude above launch in pilot's altitude units
     */
    getAltitudeAboveLaunch: function(siteId, flightAltitude) {
        var siteAltitude = siteId ? SiteModel.getLaunchAltitude(siteId) : 0;
        var altitudeDiff = parseFloat(flightAltitude) - parseFloat(siteAltitude);
        return Altitude.getAltitudeInPilotUnits(altitudeDiff);
    },


    /**
     * @returns {number|null} - days passed since the last flight
     */
    getDaysSinceLastFlight: function() {
        var lastFlight = this.getLastFlight();

        if (lastFlight === null) {
            return null;
        }
        
        var millisecondsSince = Date.now() - Date.parse(lastFlight.date);
        return Math.floor(millisecondsSince / (24 * 60 * 60 * 1000));
    },
    

    getNumberOfFlights: function() {
        return Object.keys(this.getStoreContent()).length;
    },
    

    getNumberOfFlightsThisYear: function() {
        var date = new Date();
        var year = date.getFullYear();

        return objectValues(this.getStoreContent())
            .reduce(
                (numberOfFlights, flight) => {
                    if (flight.date.substring(0, 4) === year.toString()) {
                        return ++numberOfFlights;
                    }
                    return numberOfFlights;
                },
                0
            );
    },


    /**
     * @param {function} statFilter - function that returns true or false depending on parsed object to it
     * @returns {{total: number, thisYear: number}} - flight statistics for given filter
     * e.g. total flights and flights for this year at particular site
     */
    getFlightStats: function(statFilter) {
        var date = new Date();
        var year = date.getFullYear();
        var numberOfFlights = {
            total: 0,
            thisYear: 0
        };

        objectValues(this.getStoreContent()).forEach(flight => {
            if (statFilter(flight)) {
                numberOfFlights.total++;

                if (flight.date.substring(0, 4) === year.toString()) {
                    numberOfFlights.thisYear++;
                }
            }
        });

        return numberOfFlights;
    },


    /**
     * @param {number} gliderId
     * @returns {object} - number of flights for given glider recorded in App
     * keys: total, thisYear
     */
    getNumberOfFlightsOnGlider: function(gliderId) {
        return this.getFlightStats(flight => flight.gliderId === gliderId);
    },
    

    /**
     * @param {number} siteId
     * @returns {object} - number of flights at given site
     * keys: total, thisYear
     */
    getNumberOfFlightsAtSite: function(siteId) {
        return this.getFlightStats(flight => flight.siteId === siteId);
    },

    
    /**
     * @returns {number} - number of sites which pilot flew at and has flight record in App
     */
    getNumberOfVisitedSites: function() {
        return objectValues(this.getStoreContent())
            .reduce(
                Util.uniqueValues('siteId'),
                []
            )
            .length;
    },

    
    /**
     * @returns {number} - number of gliders which pilot used and has flight record in App
     */
    getNumberOfUsedGliders: function() {
        return objectValues(this.getStoreContent())
            .reduce(
                Util.uniqueValues('gliderId'),
                []
            )
            .length;
    },

    
    /**
     * @returns {number} - airtime of all flights recorded in App
     */
    getTotalAirtime: function() {
        return _.sum(this.getStoreContent(), 'airtime');
    },

    
    /**
     * @param {number} gliderId
     * @returns {number} - airtime for given glider recorded in App
     */
    getGliderAirtime: function(gliderId) {
        return objectValues(this.getStoreContent())
            .reduce(
                (totalAirtime, flight) => {
                    if (flight.gliderId === gliderId) {
                        totalAirtime += flight.airtime;
                    }
                    return totalAirtime;
                },
                0
            );
    }
};


FlightModel = _.extend({}, BaseModel, FlightModel);


module.exports = FlightModel;
