'use strict';

var _ = require('lodash');
var objectValues = require('object.values');

var BaseModel = require('./base-model');
var Util = require('../utils/util');


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
                field: 'Initial Number of Flights'
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
        var storeContent = this.getStoreContent();
        if (!storeContent || storeContent.error) {
            return storeContent;
        }

        // require FlightModel here so as to avoid circle requirements
        var FlightModel = require('./flight');

        return objectValues(storeContent).map(glider => {
            return {
                id: glider.id,
                name: glider.name,
                trueFlightNum: glider.initialFlightNum + FlightModel.getNumberOfFlightsOnGlider(glider.id).total,
                trueAirtime: glider.initialAirtime + FlightModel.getGliderAirtime(glider.id)
            };
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
        var glider = this.getStoreContent(gliderId);
        if (!glider || glider.error) {
            return glider;
        }

        // require FlightModel here so as to avoid circle requirements
        var FlightModel = require('./flight');

        var flightNumObj = FlightModel.getNumberOfFlightsOnGlider(glider.id);
        var trueFlightNum = glider.initialFlightNum + flightNumObj.total;
        var flightNumThisYear = flightNumObj.thisYear;

        return {
            id: glider.id,
            name: glider.name,
            remarks: glider.remarks,
            initialFlightNum: glider.initialFlightNum,
            initialAirtime: glider.initialAirtime,
            trueFlightNum: trueFlightNum,
            trueAirtime: glider.initialAirtime + FlightModel.getGliderAirtime(glider.id),
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
        if (gliderId === undefined) {
            return this.getNewItemOutput();
        }

        var glider = this.getStoreContent(gliderId);
        if (!glider || glider.error) {
            return glider;
        }
        
        // If initialFlightNum or hours or minutes is 0 show empty string to user
        // So user won't need to erase 0 before entering other value
        var initialFlightNum = glider.initialFlightNum || '';
        var hoursMinutes = Util.getHoursMinutes(glider.initialAirtime);

        return {
            id: glider.id,
            name: glider.name,
            initialFlightNum: initialFlightNum.toString(),
            hours: hoursMinutes.hours ? hoursMinutes.hours.toString() : '',
            minutes: hoursMinutes.minutes ? hoursMinutes.minutes.toString() : '',
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
        var storeContent = this.getStoreContent();
        if (!storeContent || storeContent.error) {
            return storeContent;
        }

        return {
            name: '',
            initialFlightNum: '',
            hours: '',
            minutes: '',
            remarks: ''
        };
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
     * @param {number} gliderId - assumption: glider id exists
     * @returns {string|null} - glider's name or null if no glider with given id
     */
    getGliderName: function(gliderId) {
        var getStoreContent = this.getStoreContent(gliderId);
        return !getStoreContent.error ? getStoreContent.name : null;
    },
    

    /**
     * @returns {number|null} - id of last created glider or null if no gliders yet
     */
    getLastAddedId: function() {
        var storeContent = this.getStoreContent();
        if (_.isEmpty(storeContent)) {
            return null;
        }

        return _.max(storeContent, glider => Date.parse(glider.createdAt)).id;
    },

    
    /**
     * This presentation is required for dropdown options
     * @returns {Array} - array of objects where value is glider id, text is glider name
     */
    getGliderValueTextList: function() {
        return objectValues(this.getStoreContent()).map(Util.valueTextPairs('id', 'name'));
    }
};


GliderModel = _.extend({}, BaseModel, GliderModel);


module.exports = GliderModel;
