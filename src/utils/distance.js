import dataService from '../services/data-service';

const Distance = {
  unitConverter: {
    km: 0.001,
    mi: 0.000621371
  },

  distanceUnitsShort: {
    kilometers: 'km',
    miles: 'mi'
  },

  /**
   * Returns distance between two points in m.
   * Stolen from here: https://www.geodatasource.com/developers/javascript
   * Theory: https://en.wikipedia.org/wiki/Great-circle_distance
   * @param {number} lat1
   * @param {number} lng1
   * @param {number} lat2
   * @param {number} lng2
   * @return {number}
   */
  getDistance(lat1, lng1, lat2, lng2) {
    if ((lat1 === lat2) && (lng1 === lng2)) {
      return 0;
    }

    // Converting Latitude to Radians:
    const radlat1 = Math.PI * lat1 / 180;
    const radlat2 = Math.PI * lat2 / 180;

    // Converting Longitude degrees between two points to Radians:
    const theta = lng1 - lng2;
    const radtheta = Math.PI * theta / 180;

    // Calculations of great-circle distance between points using trigonometric functions.
    let acosDist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (acosDist > 1) {
      acosDist = 1;
    }
    const radDist = Math.acos(acosDist);

    // Converting Radians to distance (meters):
    const earthRadiusInMeters = 6371000;
    const meterDist = radDist * earthRadiusInMeters;

    return meterDist;
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
