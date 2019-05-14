'use strict';

const dataService = require('../services/data-service');
const Util = require('./util');


const Altitude = {
    meterConverter: {
        meters: 1,
        feet: 3.28084
    },

    altitudeUnitsShort: {
        meters: 'm',
        feet: 'ft'
    },

    velocityUnits: {
        meters: 'm/s',
        feet: 'ft/min'
    },

    velocityConverter: {
        'm/s': 1,
        'ft/min': 196.85
    },

    /**
     * Gets name of current user's altitude units
     * @returns {string} name of current user's altitude units
     */
    getUserAltitudeUnit: function() {
        return dataService.store.pilot.altitudeUnit;
    },

    /**
     * @returns {string} - short version of altitude units
     */
    getUserAltitudeUnitShort: function() {
        return this.altitudeUnitsShort[this.getUserAltitudeUnit()];
    },

    /**
     * Based on user's altitude unit, gets user's altitude velocity unit, e.g. "m/s' for "meters".
     * @return {string} – name of the altitude velocity unit
     */
    getUserVelocityUnit: function() {
        const altUnit = this.getUserAltitudeUnit();
        return this.velocityUnits[altUnit];
    },

    /**
     * @param {number} altitude
     * @returns {string} - altitude followed by user's altitude units or '–'
     */
    formatAltitude: function(altitude) {
        const formattedAltitude = (altitude > 0) ? `${altitude} ${this.getUserAltitudeUnit()}` : null;
        return Util.formatText(formattedAltitude);
    },

    /**
     * @param {number} altitude
     * @returns {string} - altitude followed by short version of user's altitude units or '–'
     */
    formatAltitudeShort: function(altitude) {
        const formattedAltitude = altitude ? `${altitude} ${this.getUserAltitudeUnitShort()}` : null;
        return Util.formatText(formattedAltitude);
    },

    /**
     * Modifies altitude in meters into current user's altitude units
     * @param {number|string} altitude in meters
     * @returns {number} altitude in pilot's altitude units
     */
    getAltitudeInPilotUnits: function(altitude) {
        const increment = this.meterConverter[this.getUserAltitudeUnit()];
        return Math.round(parseFloat(altitude) * increment);
    },

    /**
     * Modifies altitude in meters into provided altitude units
     * @param {number|string} altitude in meters
     * @param {string} units to convert into
     * @returns {number} altitude in given units
     */
    getAltitudeInGivenUnits: function(altitude, units) {
        const multiplier = this.meterConverter[units];
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
     * @param {string} units – user settings units
     * @returns {number} altitude in meters
     */
    getAltitudeInMeters: function(nextValue, previousValue, units) {
        const previousParsedVal = this.getAltitudeInPilotUnits(previousValue);
        if (nextValue !== previousParsedVal || units !== this.getUserAltitudeUnit()) {
            return this.convertAltitudeToMeters(nextValue, units);
        }
        return previousValue;
    },

    /**
     * Convert altitude from feet to meters. Won't change it if altitude is already in meters.
     * @param {number} altitude – Altitude to convert to meters.
     * @param {string} units – Measurement unit of provided altitude, e.g. meters, feet.
     * @return {number} – Altitude in meters.
     */
    convertAltitudeToMeters: function(altitude, units) {
        return altitude / this.meterConverter[units];
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
        return this.getAltitudeUnitsList().map(unitName => {
            return {
                value: unitName,
                text: unitName
            };
        });
    },

    /**
     * Modifies velocity in meters per second into provided velocity units
     * @param {number|string} value – Value in meters per second
     * @param {string} units – Units to convert into
     * @returns {number} – Altitude velocity in given units
     */
    getVelocityInGivenUnits: function(value, units) {
        const multiplier = this.velocityConverter[units];
        return Math.round(parseFloat(value) * multiplier);
    }
};


module.exports = Altitude;
