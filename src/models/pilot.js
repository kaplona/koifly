'use strict';

var $ = require('jquery');
var DataService = require('../services/data-service');
var Altitude = require('../utils/altitude');


var PilotModel = {

    formValidationConfig: {
        initialFlightNum: {
            method: 'number',
            rules: {
                min: 0,
                round: true,
                defaultVal: 0,
                field: 'Initial Flight #'
            }
        },
        initialAirtime: {
            method: 'number',
            rules: {
                min: 0,
                round: true,
                defaultVal: 0,
                field: 'Initial Airtime'
            }
        },
        altitudeUnit: {
            method: 'selectOption',
            rules: {
                getArrayOfOptions: function() {
                    return Altitude.getAltitudeUnitsList();
                },
                field: 'Glider'
            }
        },
        hours:  {
            method: 'number',
            rules: {
                min: 0,
                round: true,
                defaultVal: 0,
                field: 'Initial Airtime'
            }
        },
        minutes: {
            method: 'number',
            rules: {
                min: 0,
                round: true,
                defaultVal: 0,
                field: 'Initial Airtime'
            }
        }
    },

    getPilotOutput: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        // require FlightModel and GliderModel here so as to avoid circle requirements
        var FlightModel = require('./flight');
        var GliderModel = require('./glider');
        var flightNumTotal = DataService.data.pilot.initialFlightNum + FlightModel.getNumberOfFlights();
        var airtimeTotal = DataService.data.pilot.initialAirtime + FlightModel.getTotalAirtime();
        var siteNum = FlightModel.getNumberOfVisitedSites();
        var gliderNum = GliderModel.getNumberOfGliders();

        return {
            userName: DataService.data.pilot.userName,
            flightNumTotal: flightNumTotal,
            airtimeTotal: airtimeTotal,
            siteNum: siteNum,
            gliderNum: gliderNum,
            altitudeUnit: DataService.data.pilot.altitudeUnit
        };
    },

    getPilotEditOutput: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        return {
            userName: DataService.data.pilot.userName,
            initialFlightNum: DataService.data.pilot.initialFlightNum,
            initialAirtime: DataService.data.pilot.initialAirtime,
            altitudeUnit: DataService.data.pilot.altitudeUnit
        };
    },

    checkForLoadingErrors: function() {
        // Check for loading errors
        if (DataService.data.loadingError !== null) {
            DataService.loadData();
            return { error: DataService.data.loadingError };
        // Check if data was loaded
        } else if (DataService.data.pilot === null) {
            DataService.loadData();
            return null;
        }
        return false;
    },

    savePilotInfo: function(newPilotInfo) {
        newPilotInfo = this.setDefaultValues(newPilotInfo);
        var pilot = {};
        pilot.initialFlightNum = parseInt(newPilotInfo.initialFlightNum);
        pilot.initialAirtime = parseInt(newPilotInfo.initialAirtime);
        pilot.altitudeUnit = newPilotInfo.altitudeUnit;
        return DataService.changePilotInfo(pilot);
    },

    setDefaultValues: function(newPilotInfo) {
        $.each(this.formValidationConfig, (fieldName, config) => {
            // If there is default value for the field which val is null or undefined or ''
            if ((newPilotInfo[fieldName] === null ||
                 newPilotInfo[fieldName] === undefined ||
                (newPilotInfo[fieldName] + '').trim() === '') &&
                 config.rules.defaultVal !== undefined
            ) {
                // Set it to its default value
                newPilotInfo[fieldName] = config.rules.defaultVal;
            }
        });
        return newPilotInfo;
    },
    
    getValidationConfig: function() {
        return this.formValidationConfig;
    }
};


module.exports = PilotModel;
