'use strict';

var dataService = require('../services/data-service');


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
        return dataService.store.pilot.altitudeUnit;
    },

    /**
     * Modifies altitude in meters into current user's altitude units
     * @param {number} altitude in meters
     * @returns {number} altitude in pilot's altitude units
     */
    getAltitudeInPilotUnits: function(altitude) {
        var increment = this.meterConverter[dataService.store.pilot.altitudeUnit];
        return Math.round(parseFloat(altitude) * increment);
    },

    /**
     * Modifies altitude in meters into provided altitude units
     * @param {number} altitude in meters
     * @param {string} units to convert into
     * @returns {number} altitude in given units
     */
    getAltitudeInGivenUnits: function(altitude, units) {
        var multiplier = this.meterConverter[units];
        return Math.round(parseFloat(altitude) * multiplier);
    },

    /**
     * Modifies altitude from provided altitude units into meters
     * If user changed neither altitude nor units take previous value
     * (altitude is always displayed rounded for user, so rounded value is submitted)
     * We need to keep exact the same value in meters in DB
     * in order to get the same value in feet (or other units) all the times
     * @param {number} nextValue - new value inserted by user
     * @param {number} previousValue - old value to compare to
     * @param {string} units chose by user
     * @returns {number} altitude in meters
     */
    getAltitudeInMeters: function(nextValue, previousValue, units) {
        var previousFilteredVal = this.getAltitudeInPilotUnits(previousValue);
        if (nextValue !== previousFilteredVal || units !== dataService.store.pilot.altitudeUnit) {
            return nextValue / this.meterConverter[units];
        }
        return previousValue;
    },

    /**
     * Gets all available for using altitude units
     * @returns {Array} list of altitude units
     */
    getAltitudeUnitsList: function() {
        return Object.keys(this.meterConverter);
    },

    /**
     * Gets all available for using altitude units
     * in {value: value, text: text} format
     * for using in dropdown component
     * @returns {Array} list of altitude units objects
     */
    getAltitudeUnitsValueTextList: function() {
        return this.getAltitudeUnitsList().map((unitName) => {
            return {
                value: unitName,
                text: unitName
            };
        });
    }
};


module.exports = Altitude;
