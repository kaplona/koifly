'use strict';

var $ = require('jquery');
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

    getGliderOutput: function(id) {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        var FlightModel = require('./flight');
        var trueFlightNum = DataService.data.gliders[id].initialFlightNum + FlightModel.getNumberOfFlightsOnGlider(id);
        var trueAirtime = DataService.data.gliders[id].initialAirtime + FlightModel.getGliderAirtime(id);

        return {
            id: id,
            name: DataService.data.gliders[id].name,
            initialFlightNum: DataService.data.gliders[id].initialFlightNum,
            initialAirtime: DataService.data.gliders[id].initialAirtime,
            remarks: DataService.data.gliders[id].remarks,
            trueFlightNum: trueFlightNum,
            trueAirtime: trueAirtime
        };
    },

    getNewGliderOutput: function() {
        var loadingError = this.checkForLoadingErrors();
        if (loadingError !== false) {
            return loadingError;
        }

        return {
            name: '',
            initialFlightNum: 0,
            initialAirtime: 0,
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

        var glider = {};
        glider.id = newGlider.id;
        glider.name = newGlider.name;
        glider.initialFlightNum = parseInt(newGlider.initialFlightNum);
        glider.initialAirtime = parseFloat(newGlider.initialAirtime);
        glider.remarks = newGlider.remarks;
        return glider;
    },

    setDefaultValues: function(newGlider) {
        $.each(this.formValidationConfig, (fieldName, config) => {
            // If there is default value for the field which val is null or undefined or ''
            if ((newGlider[fieldName] === null ||
                 newGlider[fieldName] === undefined ||
                (newGlider[fieldName] + '').trim() === '') &&
                 config.rules.defaultVal !== undefined
            ) {
                // Set it to its default value
                newGlider[fieldName] = config.rules.defaultVal;
            }
        });
        return newGlider;
    },

    deleteGlider: function(gliderId) {
        return DataService.changeGlider({ id: gliderId, see: 0 });
    },

    getNumberOfGliders: function() {
        return Object.keys(DataService.data.gliders).length;
    },

    getGliderNameById: function(id) {
        return DataService.data.gliders[id].name;
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
