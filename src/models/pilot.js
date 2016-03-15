'use strict';

var _ = require('lodash');

var dataService = require('../services/data-service');
var ErrorTypes = require('../errors/error-types');


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

        // require FlightModel here so as to avoid circle requirements
        var FlightModel = require('./flight');

        // Get pilot info from Data Service helper
        var pilot = dataService.store.pilot;

        var flightNumTotal = pilot.initialFlightNum + FlightModel.getNumberOfFlights();
        var flightNumThisYear = FlightModel.getNumberOfFlightsThisYear();
        var airtimeTotal = pilot.initialAirtime + FlightModel.getTotalAirtime();
        var siteNum = FlightModel.getNumberOfVisitedSites();
        var gliderNum = FlightModel.getNumberOfUsedGliders();
        var daysSinceLastFlight = this.getDaysSinceLastFlight();

        return {
            email: pilot.email,
            userName: pilot.userName,
            flightNumTotal: flightNumTotal,
            flightNumThisYear: flightNumThisYear,
            airtimeTotal: airtimeTotal,
            siteNum: siteNum,
            gliderNum: gliderNum,
            altitudeUnit: pilot.altitudeUnit,
            daysSinceLastFlight: daysSinceLastFlight
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
        var pilot = dataService.store.pilot;

        return {
            email: pilot.email,
            userName: pilot.userName,
            initialFlightNum: pilot.initialFlightNum.toString(),
            altitudeUnit: pilot.altitudeUnit,
            hours: Math.floor(pilot.initialAirtime / 60).toString(),
            minutes: (pilot.initialAirtime % 60).toString()
        };
    },

    /**
     * @returns {false|null|object}
     * false - if no errors
     * null - if no errors but no data either
     * error object - if error
     */
    checkForLoadingErrors: function() {
        // Check for loading errors
        if (dataService.loadingError !== null) {
            dataService.initiateStore();
            return { error: dataService.loadingError };
        // Check if data was loaded
        } else if (dataService.store.pilot === null) {
            dataService.initiateStore();
            return null;
        }
        return false;
    },

    /**
     * @returns {number|null} - days passed since the last flight
     */
    getDaysSinceLastFlight: function() {
        // require FlightModel here so as to avoid circle requirements
        var FlightModel = require('./flight');

        var lastFlightDate = FlightModel.getLastFlightDate();

        if (lastFlightDate === null) {
            return null;
        }

        var milisecondsSince = Date.now() - Date.parse(lastFlightDate);
        return Math.floor(milisecondsSince / (24 * 60 * 60 * 1000));
    },

    /**
     * @param {object} newPilotInfo
     * @returns {Promise} - if saving was successful or not
     */
    savePilotInfo: function(newPilotInfo) {
        newPilotInfo = this.setPilotInput(newPilotInfo);
        return dataService.savePilotInfo(newPilotInfo);
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

        // Return only fields which will be send to the server
        return {
            userName: newPilotInfo.userName,
            initialFlightNum: parseInt(newPilotInfo.initialFlightNum),
            initialAirtime: parseInt(newPilotInfo.hours) * 60 + parseInt(newPilotInfo.minutes),
            altitudeUnit: newPilotInfo.altitudeUnit
        };
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
     * Sends passwords to the server
     * @param {string} currentPassword
     * @param {string} nextPassword
     * @returns {Promise} - if saving was successful or not
     */
    changePassword: function(currentPassword, nextPassword) {
        return dataService.changePassword(currentPassword, nextPassword);
    },

    /**
     * @returns {string|null} - email address or null if no pilot information in front end yet
     */
    getEmailAddress: function() {
        if (dataService.store.pilot === null) {
            return null;
        }
        return dataService.store.pilot.email;
    },
    
    getValidationConfig: function() {
        return this.formValidationConfig;
    },

    /**
     * @returns {boolean|null} - is pilot's email was verified,
     * null - if no information about pilot yet
     */
    getUserActivationStatus: function() {
        if (dataService.store.pilot === null) {
            return null;
        }
        return dataService.store.pilot.isActivated;
    },

    /**
     * @returns {boolean|null} - if show pilot notification about verifying his email,
     * true - if pilot didn't confirmed his email
     * false - if pilot confirmed his email or doesn't want to see notification about this
     * null - if data hasn't been loaded from the server yet
     */
    getActivationNoticeStatus: function() {
        if (dataService.store.pilot === null) {
            return null;
        }
        return !dataService.store.pilot.isActivationNoticeHidden && !dataService.store.pilot.isActivated;
    },

    hideActivationNotice: function() {
        if (dataService.store.pilot !== null) {
            dataService.store.pilot.isActivationNoticeHidden = true;
        }
    },

    isLoggedIn: function() {
        return (dataService.store.pilot && dataService.loadingError !== ErrorTypes.AUTHENTICATION_ERROR);
    },

    logout: function() {
        dataService.logout();
    }
};


module.exports = PilotModel;
