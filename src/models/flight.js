'use strict';

var $ = require('jquery');
var _ = require('underscore');
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
            method: 'dateFormat',
            rules: {
                field: 'Date'
            }
        },
        siteId: {
            method: 'selectOption',
            rules: {
                getArrayOfOptions: function() {
                    return SiteModel.getSiteIdsList();
                },
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
                getArrayOfOptions: function() {
                    return GliderModel.getGliderIdsList();
                },
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
        altitudeUnit: {
            method: 'selectOption',
            rules: {
                getArrayOfOptions: function() {
                    return Altitude.getAltitudeUnitsList();
                },
                field: 'Altitude Units'
            }
        }
    },

    getFlightsArray: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        var flightOutputs = [];
        $.each(DataService.data.flights, (flightId) => {
            flightOutputs.push(this.getFlightOutput(flightId));
        });
        return flightOutputs;
    },

    getFlightOutput: function(id) {
        var loadingError = this.checkForLoadingErrors(id);
        if (loadingError !== false) {
            return loadingError;
        }

        // If site is not defined for this flight show empty string to user instead
        var siteId = DataService.data.flights[id].siteId;
        var siteName = '';
        if (siteId !== null) {
            siteName = SiteModel.getSiteNameById(siteId);
        }
        // If glider is not defined for this flight show empty string to user instead
        var gliderId = DataService.data.flights[id].gliderId;
        var gliderName = '';
        if (gliderId !== null) {
            gliderName = GliderModel.getGliderNameById(gliderId);
        }

        var date = DataService.data.flights[id].date.substring(0, 10);
        var altitude = Altitude.getAltitudeInPilotUnits(DataService.data.flights[id].altitude);
        var altitudeUnit = Altitude.getUserAltitudeUnit();
        var altitudeAboveLaunch = this.getAltitudeAboveLaunches(siteId, DataService.data.flights[id].altitude);
        return {
            id: id,
            date: date,
            siteId: siteId,
            siteName: siteName,
            altitude: altitude,
            altitudeUnit: altitudeUnit,
            altitudeAboveLaunch: altitudeAboveLaunch,
            airtime: DataService.data.flights[id].airtime,
            gliderId: gliderId,
            gliderName: gliderName,
            remarks: DataService.data.flights[id].remarks
        };
    },

    getNewFlightOutput: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

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

        $.each(DataService.data.flights, (flightId, flight) => {
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
        flight.airtime = newFlight.airtime;
        flight.remarks = newFlight.remarks;

        var oldAltitude = (newFlight.id !== undefined) ? DataService.data.flights[newFlight.id].altitude : 0;
        var newAltitude = newFlight.altitude;
        var newAltitudeUnit = newFlight.altitudeUnit;
        flight.altitude = Altitude.getAltitudeInMeters(newAltitude, oldAltitude, newAltitudeUnit);

        return flight;
    },

    setDefaultValues: function(newFlight) {
        var fieldsToReplace = {};
        $.each(this.formValidationConfig, (fieldName, config) => {
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
        var numberOfFlights = 0;
        $.each(DataService.data.flights, (flightId, flight) => {
            if (flight.gliderId === parseInt(gliderId)) {
                numberOfFlights++;
            }
        });
        return numberOfFlights;
    },

    getNumberOfVisitedSites: function() {
        var sitesVisited = [];
        $.each(DataService.data.flights, (flightId, flight) => {
            if (flight.siteId !== null &&
                sitesVisited.indexOf(flight.siteId) === -1
            ) {
                sitesVisited.push(flight.siteId);
            }
        });
        return sitesVisited.length;
    },

    getTotalAirtime: function() {
        var airtime = 0;
        $.each(DataService.data.flights, (flightId, flight) => {
            airtime += parseInt(flight.airtime);
        });
        return airtime;
    },

    getGliderAirtime: function(gliderId) {
        var gliderAirtime = 0;
        $.each(DataService.data.flights, (flightId, flight) => {
            if (flight.gliderId == gliderId) {
                gliderAirtime += parseFloat(flight.airtime);
            }
        });
        return gliderAirtime;
    },

    getValidationConfig: function() {
        return this.formValidationConfig;
    }
};


module.exports = FlightModel;
