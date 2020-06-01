import dataService from '../services/data-service';
import Util from './util';


const Distance = {
  unitConverter: {
    m: 1,
    km: 0.001,
    mi: 0.000621371
  },

  distanceUnitsShort: {
    meters: 'm',
    kilometers: 'km',
    miles: 'mi'
  },


  /**
   * Gets name of current user's distance units
   * @returns {string} name of current user's distance units
   */
  getUserDistanceUnit() {
    return dataService.store.pilot.distanceUnit;
  },

  /**
   * @returns {string} - short version of distance units
   */
  getUserDistanceUnitShort() {
    return this.distanceUnitsShort[this.getUserDistanceUnit()];
  },


  /**
   * Modifies distance in meters into current user's distance units
   * @param {number|string} distance in meters
   * @returns {number} distance in pilot's altitude units
   */
  getDistanceInPilotUnits(distance) {
    const increment = this.unitConverter[this.getUserDistanceUnit()];
    return parseFloat(distance) * increment;
  },

  /**
   * Modifies distance in meters into provided distance units
   * @param {number|string} distance in meters
   * @param {string} units to convert into
   * @returns {number} altitude in given units
   */
  getDistanceInGivenUnits(distance, units) {
    const multiplier = this.unitConverter[units];
    return parseFloat(distance) * multiplier;
  },

  /**
   * Gets all available for using distance units
   * @returns {Array} list of distance units
   */
  getDistanceUnitsList() {
    return Object.keys(this.distanceUnitsShort);
  },

  /**
   * Gets all available for using distance units
   * in {value: value, text: text} format
   * for using in dropdown component
   * @returns {Array} list of distance units objects
   */
  getDistanceUnitsValueTextList() {
    return this.getDistanceUnitsList().map(unitName => {
      return {
        value: unitName,
        text: unitName
      };
    });
  }
};


export default Distance;
