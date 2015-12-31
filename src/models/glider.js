'use strict';

var _ = require('lodash');
var DataService = require('../services/data-service');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');


var GliderModel = {

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
        initialAirtime: {
            method: 'number',
            rules: {
                min: 0,
                round: true,
                defaultVal: 0,
                field: 'Initial Airtime'
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
    getGlidersArray: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        return _.map(DataService.data.gliders, (glider, gliderId) => {
            return this.getGliderOutput(gliderId);
        });
    },

    /**
     * Prepare data to show to user
     * @param {number} gliderId
     * @returns {object|null} - glider
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getGliderOutput: function(gliderId) {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        // require FlightModel here so as to avoid circle requirements
        var FlightModel = require('./flight');

        // Get required glider from Data Service helper
        var glider = DataService.data.gliders[gliderId];

        var trueFlightNum = glider.initialFlightNum + FlightModel.getNumberOfFlightsOnGlider(gliderId);
        var trueAirtime = glider.initialAirtime + FlightModel.getGliderAirtime(gliderId);

        return {
            id: gliderId,
            name: glider.name,
            remarks: glider.remarks,
            trueFlightNum: trueFlightNum,
            trueAirtime: trueAirtime
        };
    },

    /**
     * Prepare data to show to user
     * @param {number} gliderId
     * @returns {object|null} - glider
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getGliderEditOutput: function(gliderId) {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        if (gliderId === undefined) {
            return this.getNewGliderOutput();
        }

        // Get required glider from Data Service helper
        var glider = DataService.data.gliders[gliderId];

        var hours = Math.floor(glider.initialAirtime / 60);
        var minutes = glider.initialAirtime % 60;

        return {
            id: gliderId,
            name: glider.name,
            initialFlightNum: glider.initialFlightNum,
            initialAirtime: glider.initialAirtime,
            hours: hours,
            minutes: minutes,
            remarks: glider.remarks
        };
    },

    /**
     * Prepare data to show to user
     * @returns {object|null} - glider
     * null - if no data in front end
     * error object - if data wasn't loaded due to error
     */
    getNewGliderOutput: function() {
        return {
            name: '',
            initialFlightNum: 0,
            initialAirtime: 0,
            hours: 0,
            minutes: 0,
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
        if (DataService.data.loadingError !== null) {
            DataService.loadData();
            return { error: DataService.data.loadingError };
        // Check if data was loaded
        } else if (DataService.data.gliders === null) {
            DataService.loadData();
            return null;
        // Check if required id exists
        } else if (gliderId && DataService.data.gliders[gliderId] === undefined) {
            return { error: new KoiflyError(ErrorTypes.NO_EXISTENT_RECORD) };
        }
        return false;
    },

    /**
     * @param {object} newGlider
     * @returns {Promise} - if saving was successful or not
     */
    saveGlider: function(newGlider) {
        newGlider = this.setGliderInput(newGlider);
        return DataService.changeGlider(newGlider);
    },

    /**
     * Fills empty fields with their defaults
     * takes only fields that should be send to the server
     * modifies some values how they should be stored in DB
     * @param {object} newGlider
     * @returns {object} - glider ready to send to the server
     */
    setGliderInput: function(newGlider) {
        // Set default values to empty fields
        newGlider = this.setDefaultValues(newGlider);

        // Create a glider only with fields which will be send to the server
        var glider = {};
        glider.id = newGlider.id;
        glider.name = newGlider.name;
        glider.initialFlightNum = parseInt(newGlider.initialFlightNum);
        glider.initialAirtime = parseInt(newGlider.hours) * 60 + parseInt(newGlider.minutes);
        glider.remarks = newGlider.remarks;
        return glider;
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

    /**
     * @param {number} gliderId
     * @returns {Promise} - if deleting was successful or not
     */
    deleteGlider: function(gliderId) {
        return DataService.changeGlider({ id: gliderId, see: 0 });
    },

    getNumberOfGliders: function() {
        return Object.keys(DataService.data.gliders).length;
    },

    /**
     * @param {number} id
     * @returns {string|null} - glider's name or null if no glider with given id
     */
    getGliderNameById: function(id) {
        return DataService.data.gliders[id] ? DataService.data.gliders[id].name : null;
    },

    /**
     * @returns {number|null} - id of last created glider or null if no gliders yet
     */
    getLastAddedId: function() {
        if (_.isEmpty(DataService.data.gliders)) {
            return null;
        }

        var lastAddedGlider = _.min(DataService.data.gliders, (glider) => {
            return glider.createdAt;
        });
        return lastAddedGlider.id;
    },

    /**
     * This gliders presentation is needed for dropdowns
     * @returns {Array} - array of objects where value is glider id, text is site name
     */
    getGliderValueTextList: function() {
        return _.map(DataService.data.gliders, (glider, gliderId) => {
            return { value: gliderId, text: glider.name };
        });
    },

    getGliderIdsList: function() {
        return Object.keys(DataService.data.gliders);
    },

    getValidationConfig: function() {
        return this.formValidationConfig;
    }
};


module.exports = GliderModel;
