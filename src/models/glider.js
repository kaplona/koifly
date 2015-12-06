'use strict';

var $ = require('jquery');
var _ = require('underscore');
var DataService = require('../services/data-service');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');


var GliderModel = {

    formValidationConfig: {
        name: {
            method: 'unique',
            rules: {
                getDataArray: function() {
                    return GliderModel.getGlidersArray();
                },
                field: 'Name'
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
                field: 'Remarks'
            }
        }
    },

    getGlidersArray: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        var gliderOutputs = [];
        $.each(DataService.data.gliders, (gliderId) => gliderOutputs.push(this.getGliderOutput(gliderId)));
        return gliderOutputs;
    },

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

    saveGlider: function(newGlider) {
        newGlider = this.setGliderInput(newGlider);
        return DataService.changeGlider(newGlider);
    },

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

    setDefaultValues: function(newGlider) {
        var fieldsToReplace = {};
        $.each(this.formValidationConfig, (fieldName, config) => {
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

    deleteGlider: function(gliderId) {
        return DataService.changeGlider({ id: gliderId, see: 0 });
    },

    getNumberOfGliders: function() {
        return Object.keys(DataService.data.gliders).length;
    },

    getGliderNameById: function(id) {
        return DataService.data.gliders[id] ? DataService.data.gliders[id].name : null;
    },

    // Return last added glider id or null if no data has been added yet
    getLastAddedId: function() {
        var lastGlider = {
            id: null,
            creationDateTime: '1900-01-01 00:00:00'
        };
        $.each(DataService.data.gliders, (gliderId, glider) => {
            if (lastGlider.creationDateTime < glider.creationDateTime) {
                lastGlider = glider;
            }
        });
        return lastGlider.id;
    },

    getGliderSimpleList: function() {
        var simpleList = {};
        $.each(DataService.data.gliders, (gliderId, glider) => {
            simpleList[gliderId] = glider.name;
        });
        return simpleList;
    },

    getGliderValueTextList: function() {
        var valueTextList = [];
        $.each(DataService.data.gliders, (gliderId, glider) => {
            valueTextList.push({ value: gliderId, text: glider.name });
        });
        return valueTextList;
    },

    getGliderIdsList: function() {
        return Object.keys(DataService.data.gliders);
    },

    getValidationConfig: function() {
        return this.formValidationConfig;
    }
};


module.exports = GliderModel;
