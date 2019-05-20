'use strict';

const distanceService = {
  distanceUnits: {
    km: 'km',
    mile: 'mile'
  },

  unitConverter: {
    km: 1,
    mile: 0.621371
  },

  /**
   * Returns distance between two points in km.
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
   * Converts distance in km into provided units
   * @param {number|string} distance – Distance in km
   * @param {string} units – Units to convert into
   * @returns {number} – Altitude velocity in given units
   */
  getDistanceInGivenUnits: function(distance, units) {
    const multiplier = this.unitConverter[units];
    return Math.round(parseFloat(distance) * multiplier);
  }
};

module.exports = distanceService;
