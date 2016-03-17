'use strict';

var _ = require('lodash');

var BaseModel = require('./base-model');
var dataService = require('../services/data-service');
var ErrorTypes = require('../errors/error-types');
var KoiflyError = require('../errors/error');


var GliderModel = {

    keys: {
        single: 'glider',
        plural: 'gliders'
    },

    formValidationConfig: {
        name: {
            isRequired: true,
            method: 'text',
            rules: {
                defaultVal: '',
                maxLength: 100,
                field: 'Glider name'
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
        hours: {
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
     * @returns {array|null|object} - array of gliders
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getListOutput: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        return _.map(dataService.store.gliders, (glider, gliderId) => {
            return this.getItemOutput(gliderId);
        });
    },

    
    /**
     * Prepare data to show to user
     * @param {string} gliderId
     * @returns {object|null} - glider
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getItemOutput: function(gliderId) {
        var loadingError = this.checkForLoadingErrors(gliderId);
        if (loadingError !== false) {
            return loadingError;
        }

        // require FlightModel here so as to avoid circle requirements
        var FlightModel = require('./flight');

        // Get required glider from Data Service helper
        var glider = dataService.store.gliders[gliderId];

        var flightNumObj = FlightModel.getNumberOfFlightsOnGlider(gliderId);
        var trueFlightNum = glider.initialFlightNum + flightNumObj.total;
        var flightNumThisYear = flightNumObj.thisYear;

        return {
            id: glider.id,
            name: glider.name,
            remarks: glider.remarks,
            initialFlightNum: glider.initialFlightNum,
            initialAirtime: glider.initialAirtime,
            trueFlightNum: trueFlightNum,
            trueAirtime: glider.initialAirtime + FlightModel.getGliderAirtime(gliderId),
            flightNumThisYear: flightNumThisYear
        };
    },

    
    /**
     * Prepare data to show to user
     * @param {number} gliderId
     * @returns {object|null} - glider
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getEditOutput: function(gliderId) {
        var loadingError = this.checkForLoadingErrors(gliderId);
        if (loadingError !== false) {
            return loadingError;
        }

        if (gliderId === undefined) {
            return this.getNewItemOutput();
        }

        // Get required glider from Data Service helper
        var glider = dataService.store.gliders[gliderId];

        return {
            id: glider.id,
            name: glider.name,
            initialFlightNum: glider.initialFlightNum.toString(),
            hours: Math.floor(glider.initialAirtime / 60).toString(),
            minutes: (glider.initialAirtime % 60).toString(),
            remarks: glider.remarks
        };
    },

    
    /**
     * Prepare data to show to user
     * @returns {object|null} - glider
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getNewItemOutput: function() {
        return {
            name: '',
            initialFlightNum: '0',
            hours: '0',
            minutes: '0',
            remarks: ''
        };
    },
    

    /**
     * @param {number} gliderId
     * @returns {false|null|object}
     * false - if no errors
     * null - if no errors but no data neither
     * error object - if error (either general error or record required by user doesn't exist)
     */
    checkForLoadingErrors: function(gliderId) {
        // Check for loading errors
        if (dataService.loadingError !== null) {
            dataService.initiateStore();
            return { error: dataService.loadingError };
        // Check if data was loaded
        } else if (dataService.store.gliders === null) {
            dataService.initiateStore();
            return null;
        // Check if required id exists
        } else if (gliderId && dataService.store.gliders[gliderId] === undefined) {
            return { error: new KoiflyError(ErrorTypes.RECORD_NOT_FOUND) };
        }
        return false;
    },
    

    /**
     * Fills empty fields with their defaults
     * takes only fields that should be send to the server
     * modifies some values how they should be stored in DB
     * @param {object} newGlider
     * @returns {object} - glider ready to send to the server
     */
    getDataForServer: function(newGlider) {
        // Set default values to empty fields
        newGlider = this.setDefaultValues(newGlider);

        // Return only fields which will be send to the server
        return {
            id: newGlider.id,
            name: newGlider.name,
            initialFlightNum: parseInt(newGlider.initialFlightNum),
            initialAirtime: parseInt(newGlider.hours) * 60 + parseInt(newGlider.minutes),
            remarks: newGlider.remarks
        };
    },
    

    /**
     * Walks through new glider and replace all empty values with default ones
     * @param {object} newGlider
     * @returns {object} - with replaced empty fields
     */
    setDefaultValues: function(newGlider) {
        var fieldsToReplace = {};
        _.each(this.formValidationConfig, (config, fieldName) => {
            // If there is default value for the field which val is null or undefined or ''
            if ((newGlider[fieldName] === null ||
                 newGlider[fieldName] === undefined ||
                (newGlider[fieldName] + '').trim() === '') &&
                 config.rules.defaultVal !== undefined
            ) {
                // Set it to its default value
                fieldsToReplace[fieldName] = config.rules.defaultVal;
            }
        });
        return _.extend({}, newGlider, fieldsToReplace);
    },
    

    getNumberOfGliders: function() {
        return Object.keys(dataService.store.gliders).length;
    },

    
    /**
     * @param {number} id
     * @returns {string|null} - glider's name or null if no glider with given id
     */
    getGliderNameById: function(id) {
        return dataService.store.gliders[id] ? dataService.store.gliders[id].name : null;
    },
    

    /**
     * @returns {number|null} - id of last created glider or null if no gliders yet
     */
    getLastAddedId: function() {
        if (_.isEmpty(dataService.store.gliders)) {
            return null;
        }

        var lastAddedGlider = _.max(dataService.store.gliders, (glider) => {
            return Date.parse(glider.createdAt);
        });
        return lastAddedGlider.id;
    },

    
    /**
     * This gliders presentation is needed for dropdowns
     * @returns {Array} - array of objects where value is glider id, text is glider name
     */
    getGliderValueTextList: function() {
        return _.map(dataService.store.gliders, (glider, gliderId) => {
            return { value: gliderId, text: glider.name };
        });
    }
};


GliderModel = _.extend({}, BaseModel, GliderModel);


module.exports = GliderModel;
