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
        altitudeUnits: {
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
        if (DataService.data.pilot === null) {
            return null;
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
            altitudeUnits: DataService.data.pilot.altitudeUnits
        };
    },

    getPilotEditOutput: function() {
        if (DataService.data.pilot === null) {
            return null;
        }
        return {
            userName: DataService.data.pilot.userName,
            initialFlightNum: DataService.data.pilot.initialFlightNum,
            initialAirtime: DataService.data.pilot.initialAirtime,
            altitudeUnits: DataService.data.pilot.altitudeUnits
        };
    },

    savePilotInfo: function(newPilotInfo) {
        newPilotInfo = this.setDefaultValues(newPilotInfo);
        var pilot = {};
        pilot.initialFlightNum = parseInt(newPilotInfo.initialFlightNum);
        pilot.initialAirtime = parseInt(newPilotInfo.initialAirtime);
        pilot.altitudeUnits = newPilotInfo.altitudeUnits;
        DataService.changePilotInfo(pilot);
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
