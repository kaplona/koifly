import dataService from './data-service';
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
   * @typedef {Object} ParsedIgc
   * @property {string|null} date – Date in yyyy-mm-dd format.
   * @property {string|null} [time] – Time in HH:MM format.
   * @property {string|null} [tz] – Time Zone as specified in Unicode CLDR project, it's a user-friendly string.
   * @property {igcRecord[]} flightPoints
   * @property {number} maxAltitude
   * @property {number} minAltitude
   * @property {number} airtime
   * @property {string} [siteId] – id of the nearest site from the pilot's library.
   *
   * Parses IGC file into list of flight points with IGC B record (Fixed record) information.
   * Extract date, airtime, max altitude, and nearest site from the records.
   * @param {string} igcFileText – IGC file content as text.
   * @return {Promise<ParsedIgc>} – Parsed igc file or error.
   */
  parseIgc(igcFileText) {
    const records = igcFileText.split('\n');
    const startIndex = this.findStartIndex(records);
    const gpsAltIndexes = this.findGpsAltitudeIndexes(records);

    const fixedRecords = records.filter((record, index) => {
      return (index > startIndex) && record.startsWith('B');
    });

    if (!fixedRecords.length) {
      return Promise.reject(new KoiflyError(errorTypes.VALIDATION_ERROR, 'No flight records in IGC file.'));
    }

    const {
      flightPoints,
      maxAltitude,
      minAltitude
    } = this.getIgcTrackDetailsFromBRecords(fixedRecords, gpsAltIndexes);

    const firstRecord = flightPoints[0];
    const lastRecord = flightPoints[flightPoints.length - 1];
    const airtimeInMinutes = Math.ceil(lastRecord.airtimeInSeconds / 60);
    const nearestSite = this.findNearestSite(firstRecord.lat, firstRecord.lng) || {};

    return this.findFlightDate(records, firstRecord.timeInSeconds, firstRecord.lat, firstRecord.lng)
      .then(({ date, time, tz }) => {
        return {
          date,
          time,
          tz,
          flightPoints,
          maxAltitude,
          minAltitude,
          airtime: airtimeInMinutes,
          siteId: nearestSite.id ? nearestSite.id.toString() : null
        };
      });
  },

  /**
   * Returns flight points and their overall altitude stats.
   * @param {string} igcFileText – IGC file content as text.
   * @return {{flightPoints: igcRecord[], maxAltitude: number, minAltitude: number}}
   */
  getIgcTrackDetails(igcFileText) {
    const records = igcFileText.split('\n');
    const startIndex = this.findStartIndex(records);
    const gpsAltIndexes = this.findGpsAltitudeIndexes(records);
    const fixedRecords = records.filter((record, index) => {
      return (index > startIndex) && record.startsWith('B');
    });
    return this.getIgcTrackDetailsFromBRecords(fixedRecords, gpsAltIndexes);
  },

  /**
   * Given a list of B records, it returns parsed flight points and altitude stats of those records.
   * @param {string[]} fixedRecords
   * @param {{start: number, end: number}|null} gpsAltIndexes – At what position in a B record,
   * we can find a number corresponded to GPS altitude.
   * @return {{flightPoints: igcRecord[], maxAltitude: number, minAltitude: number}}
   */
  getIgcTrackDetailsFromBRecords(fixedRecords, gpsAltIndexes) {
    let flightStartTimeSeconds;
    let maxAltitude = 0;
    let minAltitude = 0;
    const parsedFixedRecords = fixedRecords.map((record, index) => {
      const { airtimeInSeconds, timeInSeconds } = this.getAirtimeFromBRecord(record, flightStartTimeSeconds);
      if (index === 0) {
        flightStartTimeSeconds = timeInSeconds;
      }

      const { lat, lng } = this.getDecimalCoordsFromBRecord(record);
      const altitude = this.getAltitudeFromBRecord(record, gpsAltIndexes);
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
      flightPoints: parsedFixedRecords,
      maxAltitude,
      minAltitude
    };
  },

  /**
   * Extracts FR serial number, pilots name and flight number from igc file (used for saving igc file).
   * @param {string} fileText – IGC file content as text.
   * @return {{
   *   pilotName: string|null,
   *   flightNumber: string|null,
   *   serialNumber: string|null
   * }} – Name of pilot in charge or null if entry is not found.
   */
  findIGCFileAssets(fileText) {
    let pilotName = null;
    let flightNumber = null;
    let serialNumber = null;

    const records = fileText.split('\n');
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const isHeaderRecord = (record[0] === 'H') || (record[0] === 'A');
      if (!isHeaderRecord) {
        // header section is finished and it is not worth looking further ...
        break;
      }
      if (record[0] === 'A') {
        serialNumber = record.substring(1, 4);
      }
      if (record.substring(1, 18) === 'FPLTPILOTINCHARGE') {
        pilotName = record.substring(19);
      } else if (record.substring(1, 10) === 'FPLTPILOT') {
        pilotName = record.substring(11);
      }
      if (record.substring(1, 9) === 'FDTEDATE') {
        flightNumber = record.substring(17);
      }
    }
    return {
      pilotName: pilotName && pilotName.trim(),
      flightNumber: flightNumber && flightNumber.trim(),
      serialNumber
    };
  },

  /**
   * IGC files have a special file naming format:
   * https://xp-soaring.github.io/igc_file_format/igc_format_2008.html#link_2.5
   * @param {string} fileText – IGC file content as text.
   * @param {string} flightDate – Date in yyyy-mm-dd format
   * @return {string} – Name of the IGC file close to the standard guidelines
   */
  composeIGCFileName(fileText, flightDate) {
    const { pilotName, flightNumber, serialNumber } = this.findIGCFileAssets(fileText);

    const paddedFlightNumber = (flightNumber || 1).toString().padStart(2, '0');

    let pilotNameShort = null;
    if (pilotName) {
      const nameParts = pilotName.split(' ');
      // if pilot name consist of several words – take 1st char of the first name and 2 chars of the last name
      if (nameParts.length > 1) {
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        pilotNameShort = `${firstName.substring(0, 1)}${lastName.substring(0, 2)}`.toUpperCase();
      } else {
        // if only one name (or no spaces), use first 3 letters of this
        pilotNameShort = nameParts[0].substring(0, 3).toUpperCase();
      }
    }

    const fileParts = [flightDate, serialNumber, pilotNameShort, paddedFlightNumber];
    const fileName = fileParts
      .filter(part => Boolean(part))
      .join('-')
      .replace(/[^0-9a-z-]/gi, '');

    return `${fileName}.igc`;
  },

  /**
   * @typedef {Object} DateAndTimeInfo
   * @property {string|null} date – Date in yyyy-mm-dd format.
   * @property {string|null} [time] – Time in HH:MM format.
   * @property {string|null} [tz] – Time Zone as specified in Unicode CLDR project, it's a user-friendly string.
   *
   * Searches for header record "H" with date mnemonic "DTE".
   * Extracts date from the record, adjust date depending on the time zone.
   * @param {array.<string>} records
   * @param {number} flightStartTimeInSec
   * @param {number} lat
   * @param {number} lng
   * @return {Promise<DateAndTimeInfo>} – Date in "YYYY-MM-DD" and time in "HH:MM" format when the flight took place
   * or null if record is not found.
   */
  findFlightDate(records, flightStartTimeInSec, lat, lng) {
    const dateAndTimeInfo = {
      date: null,
      time: null,
      tz: null
    };
    const dateRecord = this.findDateInHeaderRecords(records);

    // If header record with date wasn't found, return empty date and time info.
    if (!dateRecord) {
      return dateAndTimeInfo;
    }

    const DD = dateRecord.substring(0, 2);
    const MM = dateRecord.substring(2, 4);
    const YY = dateRecord.substring(4);

    // If header record with date is corrupt and doesn't contain date, return empty date and time info.
    if (!DD || !MM || !YY || !Number(DD) | !Number(MM)) {
      return dateAndTimeInfo;
    }

    const day = Number(DD);
    const month = Number(MM);
    // Hoping that IGC format will start saving year in 4 digits in 2100
    const year = Number('20' + YY);

    const hours = Math.floor(flightStartTimeInSec / 3600);
    const min = Math.round(flightStartTimeInSec % 60);

    // adapt to date from UTC to timezone
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, min));

    return this.fetchTimezoneByLatLng(lat, lng, utcDate)
      .then(tz => {
        if (tz) {
          const localDate = new Date(utcDate.toLocaleString('en-US', { timeZone: tz }));
          dateAndTimeInfo.date = Util.dateToString(localDate);
          dateAndTimeInfo.time = Util.timeToString(localDate);
          dateAndTimeInfo.tz = tz;
        } else {
          dateAndTimeInfo.date = this.approximateFlightDate(lng, day, month, year, flightStartTimeInSec);
          dateAndTimeInfo.time = Util.timeToString(utcDate);
        }
        return dateAndTimeInfo;
      });
  },

  /**
   * Finds date string in the provided header records.
   * @param {string[]} records
   * @return {string|null} – String representing a flight date or null if header record wasn't found.
   */
  findDateInHeaderRecords(records) {
    let dateRecord = null;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const isHeaderRecord = (['A', 'C', 'H', 'I'].includes(record[0]));
      if (!isHeaderRecord) {
        // header section is finished and it is not worth looking further ...
        break;
      }
      if (record.substring(2, 5) === 'DTE') {
        if (record.substring(5, 9) === 'DATE') {
          // new spec long format (v2)
          dateRecord = record.substring(10, 16);
        } else {
          // original spec format (v1)
          dateRecord = record.substring(5);
        }
        break;
      }
    }
    return dateRecord;
  },

  /**
   * Very simplified calculation of time offset depending on launch longitude.
   * It doesn't use standard time zones for a specific longitude,
   * and simply divide globe into 24 geographical time zones.
   * This is an approximation approach and can lead to one day errors if a flight starts very late
   * in the evening or very early in the morning in an area which spreads across several geographical time zones.
   * Since standard time zones can differ from geographical time zones no more than 3 hours,
   * flight should star later than 9pm or earlier than 3am for calculation error to appear.
   * Decision was made to consider this error very unlikely to happen and negligible.
   *
   * @param {number} lng
   * @param {number} day – Digits from the Date record representing a day of the flight.
   * @param {number} month – Digits from the Date record representing minutes of the flight start.
   * @param {number} year – Digits from the Date record representing a year of the flight.
   * @param {number} flightStartTimeInSec
   * @return {string} – Date in yyyy-mm-dd format.
   */
  approximateFlightDate(lng, day, month, year, flightStartTimeInSec) {
    const sign = Math.sign(lng) || 1;
    const hoursOffset = sign * Math.floor(Math.abs(lng) * 12 / 180);
    const hours = (flightStartTimeInSec / 3600) + hoursOffset;
    if (hours > 24) {
      day = day + 1;
    }
    if (hours < 0) {
      day = day - 1;
    }

    // Using JS Date object to get a valid date in case day of the month is zero or greater that days in the month.
    return Util.dateToString(new Date(year, month - 1, day));
  },

  /**
   * Fetches time zone id using Google Time Zone API.
   * Time zone ids are defined by Unicode Common Locale Data Repository (CLDR) project
   * @see https://developers.google.com/maps/documentation/timezone/requests-timezone
   *
   * @param {number} lat
   * @param {number} lng
   * @param {Date} flightDate
   * @return {Promise<string | null>}
   */
  fetchTimezoneByLatLng(lat, lng, flightDate) {
    const latLngString = `${lat},${lng}`;
    const timestampInMillisec = flightDate.getTime();
    const timestampInSec = Math.round(timestampInMillisec / 1000);

    return dataService
      .getTimezone(latLngString, timestampInSec)
      .then(response => {
        if (response.status === 'OK' && response.timeZoneId) {
          return response.timeZoneId;
        }
        // eslint-disable-next-line no-console
        console.error('ERROR: Unable to get timezone for ' + lat + '/' + lng + ': ' + JSON.stringify(response));
        return null;
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('ERROR: Unable to get timezone for ' + lat + '/' + lng + ': ' + JSON.stringify(err));
        return null;
      });
  },

  /**
   * Searches for E record (Event record) which signifies that flight began and all followed records belong to
   * the flight. E record should include STA (Start) mnemonic.
   * @param {Array} records – List of igc file lines.
   * @return {number} – Returns start index, or -1 if igc doesn't have start event in its records.
   */
  findStartIndex(records) {
    return records.findIndex(record => {
      return record.startsWith('E') && record.includes('STA');
    });
  },

  /**
   * Searches for I record (Fixed Extension record), and checks whether it specifies that B records have GPS altitude.
   * @param {Array} records – List of igc file lines.
   * @return {{start: number, end: number}|null} – Returns object with start and end indexes (bytes) for GPS altitude
   * in B record. Or null if B records don't include GPS altitude.
   */
  findGpsAltitudeIndexes(records) {
    const standardGpsAltIndexes = { start: 30, end: 35 };
    const fixedExtensionRecord = records.find(record => record.startsWith('I'));

    // If no I record, assume that B records follow standard format and all have GPS altitude.
    // Potentially GPS altitude can be missing in B records in IGC spec v1,
    // but it will be used only if barometer altitude is not provided,
    // so it's very unlikely that a B record misses both altitude measurements.
    if (!fixedExtensionRecord) {
      return standardGpsAltIndexes;
    }

    // IGC spec v1 had GPS altitude recommended but not mandatory,
    // Check that I record contains GAL (GPS Altitude) mnemonic, and get B record indexes for GPS altitude.
    if (fixedExtensionRecord.includes('GAL')) {
      const indexesString = fixedExtensionRecord.match(/(\d\d\d\d)GAL/)[1];
      return {
        start: Number(indexesString.substr(0, 2)),
        end: Number(indexesString.substr(2, 2)) + 1
      };
    }

    // If no GAL mnemonic, check indexes for the first extension of a B record,
    // if it starts from 36 it means that B records follow recommended format and have GPS altitude.
    if (Number(fixedExtensionRecord.substr(3, 2)) >= standardGpsAltIndexes.end) {
      return standardGpsAltIndexes;
    }

    // If we are here, we are parsing old format IGC with B records which lack GPS altitude.
    return null;
  },

  /**
   * Takes bytes from B record corresponding to flight time (format is hhmmss from the beginning of the day in UTC),
   * and parses it into airtime in seconds.
   * @param {string} BRecord – IGC B record (Fixed record).
   * @param {number|null} [flightStartTimeSeconds] – Flight start time in seconds from the beginning of the day. If not provided,
   * consider B record being the first one.
   * @return {{airtimeInSeconds: number, timeInSeconds: number}} – Returns airtime in seconds from the beginning of
   * the flight, and time in seconds from the beginning of the day.
   */
  getAirtimeFromBRecord(BRecord, flightStartTimeSeconds = null) {
    const hours = Number(BRecord.substr(1, 2));
    const minutes = Number(BRecord.substr(3, 2));
    const seconds = Number(BRecord.substr(5, 2));
    let timeInSeconds = hours * 3600 + minutes * 60 + seconds;
    // Time is in UTC, so potentially it can "overflow" to next day,
    // in this case we add 24 hours the flight timestamp in order to calculate airtime correctly.
    if (flightStartTimeSeconds && timeInSeconds < flightStartTimeSeconds) {
      timeInSeconds += 24 * 3600;
    }
    const airtimeInSeconds = (flightStartTimeSeconds !== null) ? (timeInSeconds - flightStartTimeSeconds) : 0;

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
   * @param {{start:number, end:number}|null} gpsAltIndexes – Indexes of GPS altitude in B record
   * @return {number} – Returns altitude in meters.
   */
  getAltitudeFromBRecord(BRecord, gpsAltIndexes) {
    let altitude = Number(BRecord.substr(25, 5));
    if (altitude === 0 && gpsAltIndexes) {
      // fall back to GPS data
      // ... well, for real pressure altitude of '0', it will be wrong but this should not happen too often ;-)
      altitude = Number(BRecord.substring(gpsAltIndexes.start, gpsAltIndexes.end));
    }
    return altitude;
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
