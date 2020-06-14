import Altitude from '../utils/altitude';
import Distance from '../utils/distance';
import errorTypes from '../errors/error-types';
import KoiflyError from '../errors/error';
import SiteModel from '../models/site';
import Util from '../utils/util';

/**
 * @name igcService
 * @description
 * Service for parsing IGC textual data.
 * @see http://vali.fai-civl.org/documents/IGC-Spec_v1.00.pdf
 *
 * @typedef {Object} igcRecord
 * @property {number} airtimeInSeconds – Number of seconds from the beginning of the flight.
 * @property {number} altitude – Altitude in meters.
 * @property {number} altInPilotUnit – Altitude in pilot's unit. ??? do I need it here or I can calculate it on the fly?
 * @property {number} lat – Latitude.
 * @property {number} lng – Longitude.
 * @property {number} timeInSeconds – Time in seconds starting from the beginning of the day in UTC.
 */
const igcService = {
  /**
   * Parses IGC file into list of flight points with IGC B record (Fixed record) information.
   * Extract date, airtime, max altitude, and nearest site from the records.
   * @param {string} fileText – IGC file content as text.
   * @return {{flightPoints: igcRecord[], maxAltitude: number, airtime: number}|KoiflyError} – Parsed igc file or error.
   */
  parseIgc(fileText) {
    const records = fileText.split('\n');
    const startIndex = this.findStartIndex(records);

    const fixedRecords = records.filter((record, index) => {
      return (index > startIndex) && record.startsWith('B');
    });

    if (!fixedRecords.length) {
      return new KoiflyError(errorTypes.VALIDATION_ERROR, 'No flight records in IGC file.');
    }

    let flightStartTime;
    let maxAltitude;
    let minAltitude;
    const parsedFixedRecords = fixedRecords.map((record, index) => {
      const { airtimeInSeconds, timeInSeconds } = this.getAirtimeFromBRecord(record, flightStartTime);
      if (index === 0) {
        flightStartTime = timeInSeconds;
      }

      const { lat, lng } = this.getDecimalCoordsFromBRecord(record);
      const altitude = this.getAltitudeFromBRecord(record);
      const altInPilotUnit = Altitude.getAltitudeInPilotUnits(altitude);

      maxAltitude = (!maxAltitude || maxAltitude < altInPilotUnit) ? altInPilotUnit : maxAltitude;
      minAltitude = (!minAltitude || minAltitude > altInPilotUnit) ? altInPilotUnit : minAltitude;

      return {
        altitude, // in meters
        altInPilotUnit,
        lat,
        lng,
        airtimeInSeconds, // time in seconds starting from the beginning of the flight
        timeInSeconds // time in seconds starting from the beginning of a day (in UTC)
      };
    });

    const firstRecord = parsedFixedRecords[0];
    const lastRecord = parsedFixedRecords[parsedFixedRecords.length - 1];
    const date = this.findFlightDate(records, firstRecord.timeInSeconds, firstRecord.lng);
    const airtimeInMinutes = Math.ceil(lastRecord.airtimeInSeconds / 60);
    const nearestSite = this.findNearestSite(firstRecord.lat, firstRecord.lng) || {};

    // If min altitude is less than zero, a vario was not adjusted to atmospheric pressure before the flight,
    // thus make adjustment now by increasing altitude of each flight point so min altitude equals zero.
    if (minAltitude < 0) {
      const incrementInPilotUnit = Math.abs(minAltitude);
      maxAltitude += incrementInPilotUnit;
      minAltitude += incrementInPilotUnit;
      parsedFixedRecords.forEach(point => {
        point.altInPilotUnit += incrementInPilotUnit;
      });
    }

    return {
      date,
      flightPoints: parsedFixedRecords,
      maxAltitude,
      minAltitude,
      airtime: airtimeInMinutes,
      siteId: nearestSite.id ? nearestSite.id.toString() : null
    };
  },

  /**
   * Searches for header record "H" with date mnemonic "DTE".
   * Extracts date from the record, adjust date depending on timezone (longitude where flight took place).
   * @param {array.<string>} records
   * @param {number} timeInSec
   * @param {number} lng
   * @return {string|null} – Date in "YYYY-MM-DD" format when the flight took place or null if no date record exist.
   */
  findFlightDate(records, timeInSec, lng) {
    let dateRecord;
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const isHeaderRecord = (record[0] === 'H') || (record[0] === 'A');
      if (!isHeaderRecord) {
        break;
      }
      const isDateRecord = (record.substring(2, 5) === 'DTE');
      if (isDateRecord) {
        dateRecord = record;
        break;
      }
    }

    if (!dateRecord) {
      return null;
    }

    let DD = dateRecord.substring(5, 7);
    const MM = dateRecord.substring(7, 9);
    const YY = dateRecord.substring(9);
    // Hoping that IGC format will start saving year in 4 digits in 2100
    const YYYY = ('20' + YY);

    if (!DD || !MM || !YYYY) {
      return null;
    }

    // Very simplified calculation of time offset depending on launch longitude.
    // I don't use standard time zones for a specific longitude,
    // and simply divide globe into 24 geographical time zones.
    // I need only date without hours, so this approach can lead to one day errors if a flight starts very late
    // in the evening or very early in the morning in an area which spreads across several geographical time zones.
    // Since standard time zones can be differ from geographical time zones no more than 3 hours,
    // flight should star later than 9pm or earlier than 3am for calculation error to appear.
    // Decision was made to consider this error negligible.
    const sign = Math.sign(lng) || 1;
    const hoursOffset = sign * Math.floor(Math.abs(lng) * 12 / 180);
    const hours = (timeInSec / 3600) + hoursOffset;
    if (hours > 24) {
      DD += 1;
    }
    if (hours < 0) {
      DD += -1;
    }

    // Using JS Date object to get a valid date in case day of the month is zero or greater that days in the month.
    const flightDate = new Date(YYYY, Number(MM) - 1, DD);

    return Util.dateToString(flightDate);
  },

  /**
   * Searches for E record (Event record) which signifies that flight began and all followed records belong to
   * the flight. E record should include STA (Start) or ATS (Activity Tracking System) mnemonic.
   * @param {Array} records – List of igc file lines.
   * @return {number} – Returns start index, or -1 if igc doesn't have start event in its records.
   */
  findStartIndex(records) {
    return records.findIndex(record => {
      return record.startsWith('E') && (record.includes('STA') || record.includes('ATS'));
    });
  },

  /**
   * Searches for I record (Fixed Extension record), and checks whether it specifies that B records have GPS altitude.
   * @param {Array} records – List of igc file lines.
   * @return {{start: number, end: number}|null} – Returns object with start and end indexes (bytes) for GPS altitude
   * in B record. Or null if B records don't include GPS altitude.
   */
  findGpsIndexes(records) {
    let gpsAltitudeIndexes = null;
    const fixedExtensionRecord = records.find(record => record.startsWith('I'));

    if (fixedExtensionRecord) {
      // Check that I record contain GAL (GPS Altitude) mnemonic.
      if (fixedExtensionRecord.includes('GAL')) {
        const indexesString = fixedExtensionRecord.match(/(\d\d\d\d)GAL/)[1];
        gpsAltitudeIndexes = {
          start: Number(indexesString.substr(0, 2)),
          end: Number(indexesString.substr(2, 2))
        };
        // If no GAL mnemonic, check that B record follow recommended format and 31-35 bytes are reserved for GAL.
      } else if (Number(fixedExtensionRecord.substr(3, 2)) > 35) {
        gpsAltitudeIndexes = { start: 31, end: 35 };
      }
    }

    return gpsAltitudeIndexes;
  },

  /**
   * Takes bytes from B record corresponding to flight time (format is hhmmss from the beginning of the day in UTC),
   * and parses it into airtime in seconds.
   * @param {string} BRecord – IGC B record (Fixed record).
   * @param {number|null} [flightStartTime] – Flight start time in seconds from the beginning of the day. If not provided,
   * consider B record being the first one.
   * @return {{airtimeInSeconds: number, timeInSeconds: number}} – Returns airtime in seconds from the beginning of
   * the flight, and time in seconds from the beginning of the day.
   */
  getAirtimeFromBRecord(BRecord, flightStartTime = null) {
    const hours = Number(BRecord.substr(1, 2));
    const minutes = Number(BRecord.substr(3, 2));
    const seconds = Number(BRecord.substr(5, 2));
    let timeInSeconds = hours * 3600 + minutes * 60 + seconds;
    // Time is in UTC, so potentially it can "overflow" to next day,
    // in this case we add 24 hours the flight timestamp in order to calculate airtime correctly.
    if (flightStartTime && timeInSeconds < flightStartTime) {
      timeInSeconds += 24 * 3600;
    }
    const airtimeInSeconds = (flightStartTime !== null) ? (timeInSeconds - flightStartTime) : 0;

    return { airtimeInSeconds, timeInSeconds };
  },

  /**
   * Takes bytes from B record corresponding to latitude and longitude and parses them into decimal coordinates.
   * @param {string} BRecord – IGC B record (Fixed record).
   * @return {{lat: number, lng: number}} – Returns lat and lng in decimal system.
   */
  getDecimalCoordsFromBRecord(BRecord) {
    return {
      lat: this.getDecimalDegreeFromBRecordString(BRecord.substr(7, 8), true),
      lng: this.getDecimalDegreeFromBRecordString(BRecord.substr(15, 9))
    };
  },

  /**
   * Latitude format: ddmmtttD, longitude format: dddmmtttD, where d – degree digits, m – minutes digits,
   * t – represents tenths, hundredths and thousandths of minutes, D – N/S/W/E. E.g. 4914597N, 12153278W
   * @param {string} dmsString – B record partial corresponding to lat or lng in DMS format.
   * @param {Boolean} [isLatitude] – Whether dms string is latitude.
   * @return {number} – lat or lng in decimal degree coordinate system.
   */
  getDecimalDegreeFromBRecordString(dmsString, isLatitude = false) {
    const degreeDigits = isLatitude ? 2 : 3;
    const degree = Number(dmsString.substr(0, degreeDigits));
    const minutes = Number(dmsString.substr(degreeDigits, 2)) + Number(dmsString.substr(degreeDigits + 2, 3)) * 0.001;
    let decimalDegree = degree + minutes / 60;

    const negativeCardinalDirection = isLatitude ? 'S' : 'W';
    if (dmsString.substr(-1) === negativeCardinalDirection) {
      decimalDegree *= -1;
    }

    return decimalDegree;
  },

  /**
   * @param {string} BRecord – IGC B record (Fixed record).
   * @return {number} – Returns altitude in meters.
   */
  getAltitudeFromBRecord(BRecord) {
    return Number(BRecord.substr(25, 5));
  },

  /**
   * Searches for a nearest launch within 1 km radius.
   * @param {number} launchLat
   * @param {number} launchLng
   * @return {{id:number|string, distance: number}|null}
   */
  findNearestSite(launchLat, launchLng) {
    if (!launchLat || !launchLng) {
      return null;
    }

    let nearestSite = null;
    SiteModel
      .getList()
      .filter(({ lat, lng }) => {
        if (!lat || !lng) {
          return false;
        }
        // Take only flights which are within a rectangular area of 0.1 degree latitude or longitude.
        return (Math.abs(lat - launchLat) < 0.1) && (Math.abs(lng - launchLng) < 0.1);
      })
      .forEach(site => {
        const distance = Distance.getDistance(launchLat, launchLng, site.lat, site.lng);
        // Take only sites within 1 km radius.
        if ((distance < 1000) && (!nearestSite || distance < nearestSite.distance)) {
          nearestSite = {
            id: site.id,
            distance
          };
        }
      });

    return nearestSite;
  }
};

export default igcService;
