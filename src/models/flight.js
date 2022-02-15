import Altitude from '../utils/altitude';
import BaseModel from './base-model';
import GliderModel from './glider';
import SiteModel from './site';
import Util from '../utils/util';


let FlightModel = {
  keys: {
    single: 'flight',
    plural: 'flights'
  },

  formValidationConfig: {
    date: {
      isRequired: true,
      method: 'date',
      rules: {
        field: 'Date'
      }
    },
    time: {
      method: 'time',
      rules: {
        defaultVal: null,
        field: 'Time'
      }
    },
    altitude: {
      method: 'number',
      rules: {
        min: 0,
        round: true,
        defaultVal: 0,
        field: 'Altitude'
      }
    },
    hours: {
      method: 'number',
      rules: {
        min: 0,
        round: true,
        defaultVal: 0,
        field: 'Airtime'
      }
    },
    minutes: {
      method: 'number',
      rules: {
        min: 0,
        round: true,
        defaultVal: 0,
        field: 'Airtime'
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
   * @returns {array|null|object} - array of flights
   * null - if no data in front end
   * error object - if data wasn't loaded due to error
   */
  getListOutput() {
    const storeContent = this.getStoreContent();
    if (!storeContent || storeContent.error) {
      return storeContent;
    }

    return Object.values(storeContent).map(flight => {
      return {
        id: flight.id,
        date: flight.date.substring(0, 10),
        time: flight.time ? flight.time.substring(0, 5) : '',
        siteName: flight.siteId ? SiteModel.getSiteName(flight.siteId) : null,
        altitude: Altitude.getAltitudeInPilotUnits(flight.altitude),
        airtime: flight.airtime,
        createdAt: flight.createdAt
      };
    });
  },

  /**
   * Prepare data to show to user
   * @param {string|number} flightId
   * @returns {object|null} - flight
   * null - if no data in front end
   * error object - if data wasn't loaded due to error
   * or there is no flight with such id
   */
  getItemOutput(flightId) {
    const flight = this.getStoreContent(flightId);
    if (!flight || flight.error) {
      return flight;
    }

    const flightNumbers = this.getFlightNumbers(flight);

    return {
      id: flight.id,
      date: flight.date.substring(0, 10),
      time: flight.time ? flight.time.substring(0, 5) : '',
      flightNum: flightNumbers.flightNum,
      flightNumYear: flightNumbers.flightNumYear,
      flightNumDay: flightNumbers.flightNumDay,
      numOfFlightsThatDay: flightNumbers.numOfFlightsThatDay,
      siteId: flight.siteId,
      siteName: flight.siteId ? SiteModel.getSiteName(flight.siteId) : null,
      gliderName: flight.gliderId ? GliderModel.getGliderName(flight.gliderId) : null,
      altitude: Altitude.getAltitudeInPilotUnits(flight.altitude),
      altitudeAboveLaunch: this.getAltitudeAboveLaunch(flight.siteId, flight.altitude),
      airtime: flight.airtime,
      remarks: flight.remarks,
      igc: flight.igc,
      igcFileName: flight.igcFileName
    };
  },

  /**
   * Prepare data to show to user
   * @param {number} flightId
   * @returns {object|null} - flight
   * null - if no data in front end
   * error object - if data wasn't loaded due to error
   * or there is no flight with such id
   */
  getEditOutput(flightId) {
    if (!flightId) {
      return this.getNewItemOutput();
    }

    const flight = this.getStoreContent(flightId);
    if (!flight || flight.error) {
      return flight;
    }

    // If altitude or hours or minutes is 0 show empty string to user
    // So user won't need to erase 0 before entering other value
    const altitude = flight.altitude ? Altitude.getAltitudeInPilotUnits(flight.altitude) : '';
    const hoursMinutes = Util.getHoursMinutes(flight.airtime);

    return {
      id: flight.id,
      date: flight.date.substring(0, 10),
      time: flight.time ? flight.time.substring(0, 5) : '',
      siteId: (flight.siteId === null) ? null : flight.siteId.toString(),
      altitude: altitude.toString(),
      altitudeUnit: Altitude.getUserAltitudeUnit(),
      gliderId: (flight.gliderId === null) ? null : flight.gliderId.toString(),
      hours: hoursMinutes.hours ? hoursMinutes.hours.toString() : '',
      minutes: hoursMinutes.minutes ? hoursMinutes.minutes.toString() : '',
      remarks: flight.remarks,
      igc: flight.igc,
      igcFileName: flight.igcFileName
    };
  },

  /**
   * Prepare data to show to user
   * @returns {object|null} - flight
   * null - if no data in front end
   * error object - if data wasn't loaded due to error
   */
  getNewItemOutput() {
    const storeContent = this.getStoreContent();
    if (!storeContent || storeContent.error) {
      return storeContent;
    }

    let lastFlight = this.getLastFlight();
    if (lastFlight === null) {
      // Take default flight properties
      lastFlight = {
        siteId: SiteModel.getLastAddedId(), // null if no data has been added yet
        gliderId: GliderModel.getLastAddedId() // null if no data has been added yet
      };
    }

    return {
      date: Util.today(),
      time: '',
      // null if no sites yet otherwise last added site id
      siteId: (lastFlight.siteId === null) ? null : lastFlight.siteId.toString(),
      altitude: '',
      altitudeUnit: Altitude.getUserAltitudeUnit(),
      // null if no sites yet otherwise last added glider id
      gliderId: (lastFlight.gliderId === null) ? null : lastFlight.gliderId.toString(),
      hours: '',
      minutes: '',
      remarks: '',
      igc: null,
      igcFileName: null
    };
  },

  /**
   * Fills empty fields with their defaults
   * takes only fields that should be send to the server
   * modifies some values how they should be stored in DB
   * @param {object} newFlight
   * @returns {object} - flight ready to send to the server
   */
  getDataForServer(newFlight) {
    // Set default values to empty fields
    newFlight = this.setDefaultValues(newFlight);

    // Create a flight only with fields which will be sent to the server
    const flight = {
      id: newFlight.id,
      date: newFlight.date,
      time: newFlight.time,
      siteId: (newFlight.siteId === null) ? null : parseInt(newFlight.siteId),
      gliderId: (newFlight.gliderId === null) ? null : parseInt(newFlight.gliderId),
      airtime: parseInt(newFlight.hours) * 60 + parseInt(newFlight.minutes),
      remarks: newFlight.remarks,
      igc: newFlight.igc,
      igcFileName: newFlight.igcFileName
    };

    const currentAltitude = (newFlight.id !== undefined) ? this.getStoreContent(newFlight.id).altitude : 0;
    const nextAltitude = parseInt(newFlight.altitude);
    const nextAltitudeUnit = newFlight.altitudeUnit;
    flight.altitude = Altitude.getAltitudeInMeters(nextAltitude, currentAltitude, nextAltitudeUnit);

    return flight;
  },

  /**
   * Searches for a flight with the latest date
   * if several flights were on the same date the latest will be the one which was created the last
   * @returns {object|null} - last flight or null if no flights yet
   */
  getLastFlight() {
    let lastFlight = null;

    Object.values(this.getStoreContent() || {}).forEach(flight => {
      if (lastFlight === null ||
        flight.date > lastFlight.date ||
        (flight.date.substring(0, 10) === lastFlight.date.substring(0, 10) &&
          flight.createdAt > lastFlight.createdAt)
      ) {
        lastFlight = flight;
      }
    });

    return lastFlight;
  },

  /**
   * Finds target flight number out of all flights, out of flights that year, out of flights that day
   * @param {Object} targetFlight
   * @returns {{
   *      flightNum: number,
   *      flightNumYear: number,
   *      flightNumDay: number,
   *      numOfFlightsThatDay: number
   *  }} - flight number, flight number for that year, flight number for that day, number of flights that day
   */
  getFlightNumbers(targetFlight) {
    const flightNumbers = {
      flightNum: 1,
      flightNumYear: 1,
      flightNumDay: 1,
      numOfFlightsThatDay: 1
    };

    Object.values(this.getStoreContent() || {}).forEach(flight => {
      // Don't increment anything if it's our target flight or it was performed after our target flight
      if (flight.id === targetFlight.id ||
        flight.date.substring(0, 10) > targetFlight.date.substring(0, 10)
      ) {
        return;
      }

      if (flight.date.substring(0, 10) === targetFlight.date.substring(0, 10)) {
        flightNumbers.numOfFlightsThatDay++;

        // If two flights took place on the same date,
        // increment counters only if it's time is earlier.
        // If some records don't have time, imply that they took place after those with time.
        const bothHaveTime = flight.time && targetFlight.time;
        const bothDontHaveTime = !flight.time && !targetFlight.time;
        if (
          (bothHaveTime && flight.time < targetFlight.time) ||
          (flight.time && !targetFlight.time) ||
          (bothDontHaveTime && flight.createdAt < targetFlight.createdAt)
        ) {
          flightNumbers.flightNum++;
          flightNumbers.flightNumYear++;
          flightNumbers.flightNumDay++;
        }
        return;
      }

      if (flight.date.substring(0, 4) === targetFlight.date.substring(0, 4)) {
        flightNumbers.flightNumYear++;
      }

      flightNumbers.flightNum++;
    });

    return flightNumbers;
  },

  /**
   * @param {number|null} siteId
   * @param {number} flightAltitude in meters
   * @returns {number} altitude above launch in pilot's altitude units
   */
  getAltitudeAboveLaunch: function(siteId, flightAltitude) {
    const siteAltitude = siteId ? SiteModel.getLaunchAltitude(siteId) : 0;
    flightAltitude = Altitude.getAltitudeInPilotUnits(parseFloat(flightAltitude));
    return flightAltitude - siteAltitude;
  },


  /**
   * @returns {number|null} - days passed since the last flight
   */
  getDaysSinceLastFlight() {
    const lastFlight = this.getLastFlight();

    if (lastFlight === null) {
      return null;
    }

    const millisecondsSince = Date.now() - Date.parse(lastFlight.date);
    return Math.floor(millisecondsSince / (24 * 60 * 60 * 1000));
  },

  getNumberOfFlights() {
    return Object.keys(this.getStoreContent()).length;
  },

  getNumberOfFlightsThisYear() {
    const date = new Date();
    const year = date.getFullYear();

    return Object.values(this.getStoreContent() || {})
      .reduce(
        (numberOfFlights, flight) => {
          if (flight.date.substring(0, 4) === year.toString()) {
            return ++numberOfFlights;
          }
          return numberOfFlights;
        },
        0
      );
  },

  /**
   * @param {function} statFilter - function that returns true or false depending on parsed object to it
   * @returns {{total: number, thisYear: number}} - flight statistics for given filter
   * e.g. total flights and flights for this year at particular site
   */
  getFlightStats(statFilter) {
    const date = new Date();
    const year = date.getFullYear();
    const numberOfFlights = {
      total: 0,
      thisYear: 0
    };

    Object.values(this.getStoreContent() || {}).forEach(flight => {
      if (statFilter(flight)) {
        numberOfFlights.total++;

        if (flight.date.substring(0, 4) === year.toString()) {
          numberOfFlights.thisYear++;
        }
      }
    });

    return numberOfFlights;
  },

  /**
   * @param {number} gliderId
   * @returns {object} - number of flights for given glider recorded in App
   * keys: total, thisYear
   */
  getNumberOfFlightsOnGlider(gliderId) {
    return this.getFlightStats(flight => flight.gliderId === gliderId);
  },

  /**
   * @param {number} siteId
   * @returns {object} - number of flights at given site
   * keys: total, thisYear
   */
  getNumberOfFlightsAtSite(siteId) {
    return this.getFlightStats(flight => flight.siteId === siteId);
  },

  /**
   * @returns {number} - number of sites which pilot flew at and has flight record in App
   */
  getNumberOfVisitedSites() {
    return Object.values(this.getStoreContent() || {})
      .reduce(
        Util.uniqueValues('siteId'),
        []
      )
      .length;
  },

  /**
   * @returns {number} - number of gliders which pilot used and has flight record in App
   */
  getNumberOfUsedGliders() {
    return Object.values(this.getStoreContent() || {})
      .reduce(
        Util.uniqueValues('gliderId'),
        []
      )
      .length;
  },

  /**
   * @returns {number} - airtime of all flights recorded in App
   */
  getTotalAirtime() {
    const flights = Object.values(this.getStoreContent() || {});
    return flights.reduce((sum, { airtime }) => (sum + airtime), 0);
  },

  /**
   * @param {number} gliderId
   * @returns {number} - airtime for given glider recorded in App
   */
  getGliderAirtime(gliderId) {
    return Object.values(this.getStoreContent() || {})
      .reduce(
        (totalAirtime, flight) => {
          if (flight.gliderId === gliderId) {
            totalAirtime += flight.airtime;
          }
          return totalAirtime;
        },
        0
      );
  }
};


FlightModel = Object.assign({}, BaseModel, FlightModel);
export default FlightModel;
