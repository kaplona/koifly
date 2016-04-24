'use strict';

var _ = require('lodash');

var BaseModel = require('./base-model');
var dataService = require('../services/data-service');
var ErrorTypes = require('../errors/error-types');


var PilotModel = {
    
    keys: {
        single: 'pilot',
        plural: 'pilot'
    },

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

    isEmailVerificationNotice: false,
    

    /**
     * Prepare data to show to user
     * @returns {object|null} - pilot info
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getPilotOutput: function() {
        var pilot = this.getStoreContent();
        if (!pilot || pilot.error) {
            return pilot;
        }

        // require FlightModel here so as to avoid circle requirements
        var FlightModel = require('./flight');

        var flightNumTotal = pilot.initialFlightNum + FlightModel.getNumberOfFlights();
        var flightNumThisYear = FlightModel.getNumberOfFlightsThisYear();
        var airtimeTotal = pilot.initialAirtime + FlightModel.getTotalAirtime();
        var siteNum = FlightModel.getNumberOfVisitedSites();
        var gliderNum = FlightModel.getNumberOfUsedGliders();
        var daysSinceLastFlight = FlightModel.getDaysSinceLastFlight();

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
     * null - if no data at front end
     * error object - if data wasn't loaded due to error
     */
    getEditOutput: function() {
        var pilot = this.getStoreContent();
        if (!pilot || pilot.error) {
            return pilot;
        }

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
     * Fills empty fields with their defaults
     * takes only fields that should be send to the server
     * modifies some values how they should be stored in DB
     * @param {object} newPilotInfo
     * @returns {object} - pilot info ready to send to the server
     */
    getDataForServer: function(newPilotInfo) {
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
     * Sends passwords to the server
     * @param {string} currentPassword
     * @param {string} nextPassword
     * @returns {Promise} - whether saving was successful or not
     */
    changePassword: function(currentPassword, nextPassword) {
        return dataService.changePassword(currentPassword, nextPassword);
    },


    /**
     * @returns {Promise} - whether logout was successful or not
     */
    logout: function() {
        return dataService.logout();
    },


    isLoggedIn: function() {
        var pilot = this.getStoreContent();
        return (
            pilot !== null &&
            (!pilot.error || pilot.error.type !== ErrorTypes.AUTHENTICATION_ERROR)
        );
    },
    

    /**
     * @returns {string|null} - email address or null if no pilot information in front end yet
     */
    getEmailAddress: function() {
        var pilot = this.getStoreContent();
        if (!pilot || pilot.error) {
            return null;
        }
        return pilot.email;
    },
    

    /**
     * @returns {boolean} - is pilot's email verified,
     * true - if no information about pilot yet,
     * so he won't get email verification notice until we know for sure that email is not verified
     */
    getUserActivationStatus: function() {
        var pilot = this.getStoreContent();
        if (!pilot || pilot.error) {
            return true;
        }
        return pilot.isActivated;
    },
    

    /**
     * @returns {boolean} - if email verification notice should be shown,
     * true - if pilot didn't confirmed his email or no pilot info at front-end yet
     * false - if pilot confirmed his email or doesn't want to see notification about this
     */
    getEmailVerificationNoticeStatus: function() {
        return !this.getUserActivationStatus() && !this.isEmailVerificationNotice;
    },
    

    hideEmailVerificationNotice: function() {
        this.isEmailVerificationNotice = true;
    }
};


PilotModel = _.extend({}, BaseModel, PilotModel);


module.exports = PilotModel;
