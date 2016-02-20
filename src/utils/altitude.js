'use strict';

var DataService = require('../services/data-service');


var Altitude = {
    meterConverter: {
        meters: 1,
        feet: 3.28084
    },

    /**
     * Gets name of current user's altitude units
     * @returns {string} name of current user's altitude units
     */
    getUserAltitudeUnit: function() {
        return DataService.data.pilot.altitudeUnit;
    },

    /**
     * Modifies altitude in meters into current user's altitude units
     * @param {number} altitude in meters
     * @returns {number} altitude in pilot's altitude units
     */
    getAltitudeInPilotUnits: function(altitude) {
        var increment = this.meterConverter[DataService.data.pilot.altitudeUnit];
        return Math.round(parseFloat(altitude) * increment);
    },

    /**
     * Modifies altitude in meters into provided altitude units
     * @param {number} altitude in meters
     * @param {string} units to convert into
     * @returns {number} altitude in given units
     */
    getAltitudeInGivenUnits: function(altitude, units) {
        var increment = this.meterConverter[units];
        return Math.round(parseFloat(altitude) * increment);
    },

    /**
     * Modifies altitude from provided altitude units into meters
     * If user changed neither altitude nor units take old value
     * (altitude is always displayed rounded for user, so rounded value is submitted)
     * We need to keep exact the same value in meters in DB
     * in order to get the same value in feet (or other units) all the times
     * @param {number} val - new value inserted by user
     * @param {number} oldVal - old value to compare to
     * @param {string} units chose by user
     * @returns {number} altitude in meters
     */
    getAltitudeInMeters: function(val, oldVal, units) {
        var oldFilteredVal = this.getAltitudeInPilotUnits(oldVal);
        if (val != oldFilteredVal || units != DataService.data.pilot.altitudeUnit) {
            return parseFloat(val) / this.meterConverter[units];
        }
        return oldVal;
    },

    /**
     * Gets all available for using altitude units
     * @returns {array} list of altitude units
     */
    getAltitudeUnitsList: function() {
        return Object.keys(this.meterConverter);
    },

    /**
     * Gets all available for using altitude units
     * in {value: value, text: text} format
     * for using in dropdown component
     * @returns {array} list of altitude units objects
     */
    getAltitudeUnitsValueTextList: function() {
        return Object.keys(this.meterConverter).map((unitName) => {
            return {
                value: unitName,
                text: unitName
            };
        });
    }
};


module.exports = Altitude;
