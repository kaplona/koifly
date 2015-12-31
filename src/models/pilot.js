'use strict';

var _ = require('lodash');
var DataService = require('../services/data-service');


var PilotModel = {

    formValidationConfig: {
        userName: {
            method: 'text',
            rules: {
                defaultVal: '',
                maxLength: 100,
                field: 'Pilot name'
            }
        },
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

    /**
     * Prepare data to show to user
     * @returns {object|null} - pilot info
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getPilotOutput: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        // require FlightModel and GliderModel here so as to avoid circle requirements
        var FlightModel = require('./flight');
        var GliderModel = require('./glider');

        // Get pilot info from Data Service helper
        var pilot = DataService.data.pilot;

        var flightNumTotal = pilot.initialFlightNum + FlightModel.getNumberOfFlights();
        var airtimeTotal = pilot.initialAirtime + FlightModel.getTotalAirtime();
        var siteNum = FlightModel.getNumberOfVisitedSites();
        var gliderNum = GliderModel.getNumberOfGliders();

        return {
            userName: pilot.userName,
            flightNumTotal: flightNumTotal,
            airtimeTotal: airtimeTotal,
            siteNum: siteNum,
            gliderNum: gliderNum,
            altitudeUnit: pilot.altitudeUnit
        };
    },

    /**
     * Prepare data to show to user
     * @returns {object|null} - pilot info
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getPilotEditOutput: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        // Get pilot info from Data Service helper
        var pilot = DataService.data.pilot;

        var hours = Math.floor(pilot.initialAirtime / 60);
        var minutes = pilot.initialAirtime % 60;

        return {
            userName: pilot.userName,
            initialFlightNum: pilot.initialFlightNum,
            initialAirtime: pilot.initialAirtime,
            altitudeUnit: pilot.altitudeUnit,
            hours: hours,
            minutes: minutes
        };
    },

    /**
     * @returns {false|null|object}
     * false - if no errors
     * null - if no errors but no data neither
     * error object - if error
     */
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

    /**
     * @param {object} newPilotInfo
     * @returns {Promise} - if saving was successful or not
     */
    savePilotInfo: function(newPilotInfo) {
        newPilotInfo = this.setPilotInput(newPilotInfo);
        return DataService.changePilotInfo(newPilotInfo);
    },

    /**
     * Fills empty fields with their defaults
     * takes only fields that should be send to the server
     * modifies some values how they should be stored in DB
     * @param {object} newPilotInfo
     * @returns {object} - pilot info ready to send to the server
     */
    setPilotInput: function(newPilotInfo) {
        newPilotInfo = this.setDefaultValues(newPilotInfo);

        // Create a pilot only with fields which will be send to the server
        var pilot = {};
        pilot.userName = newPilotInfo.userName;
        pilot.initialFlightNum = parseInt(newPilotInfo.initialFlightNum);
        pilot.initialAirtime = parseInt(newPilotInfo.hours) * 60 + parseInt(newPilotInfo.minutes);
        pilot.altitudeUnit = newPilotInfo.altitudeUnit;
        return pilot;
    },

    /**
     * Walks through new pilot info and replace all empty values with default ones
     * @param {object} newPilotInfo
     * @returns {object} - with replaced empty fields
     */
    setDefaultValues: function(newPilotInfo) {
        var fieldsToReplace = {};
        _.each(this.formValidationConfig, (config, fieldName) => {
            // If there is default value for the field which val is null or undefined or ''
            if ((newPilotInfo[fieldName] === null ||
                 newPilotInfo[fieldName] === undefined ||
                (newPilotInfo[fieldName] + '').trim() === '') &&
                 config.rules.defaultVal !== undefined
            ) {
                // Set it to its default value
                fieldsToReplace[fieldName] = config.rules.defaultVal;
            }
        });
        return _.extend({}, newPilotInfo, fieldsToReplace);
    },

    /**
     * Takes only old and new password from new pilot info
     * sends it to the server
     * @param {object} newPilotInfo
     * @returns {Promise} - if saving was successful or not
     */
    changePass: function(newPilotInfo) {
        var passwords = {
            oldPassword: newPilotInfo.password,
            newPassword: newPilotInfo.newPassword
        };
        return DataService.changePass(passwords);
    },
    
    getValidationConfig: function() {
        return this.formValidationConfig;
    },

    /**
     * @returns {boolean|null} - is pilot confirmed his email,
     * null - if data hasn't been loaded from the server yet
     */
    getActivationStatus: function() {
        if (DataService.data.pilot === null) {
            return null;
        }
        return DataService.data.pilot.isActivated;
    }
};


module.exports = PilotModel;
