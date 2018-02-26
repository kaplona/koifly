'use strict';

const Altitude = require('../utils/altitude');
const ErrorTypes = require('../errors/error-types');
const KoiflyError = require('../errors/error');

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
     * Parses IGC file into list of flight points with IGC B record (Fixed record) information. Calculates airtime and
     * max altitude from the records.
     * @param {string} fileText – IGC file content as text.
     * @return {{flightPoints: igcRecord[], maxAltitude: number, airtime: number}|KoiflyError}
     */
    parseIgc(fileText) {
        const records = fileText.split('\n');

        let startIndex = this.findStartIndex(records);

        const fixedRecords = records.filter((record, index) => {
            return (index > startIndex) && record.startsWith('B');
        });

        if (!fixedRecords.length) {
            return new KoiflyError(ErrorTypes.VALIDATION_ERROR, 'No flight records in IGC file.');
        }

        let flightStartTime;
        let maxAltitude;
        const parsedFixedRecords = fixedRecords.map((record, index) => {
            const { airtimeInSeconds, timeInSeconds } = this.getAirtimeFromBRecord(record, flightStartTime);
            if (index === 0) {
                flightStartTime = timeInSeconds;
            }

            const { lat, lng } = this.getDecimalCoordsFromBRecord(record);
            const altitude = this.getAltitudeFromBRecord(record);
            const altInPilotUnit = Altitude.getAltitudeInPilotUnits(altitude);

            maxAltitude = (!maxAltitude || maxAltitude < altInPilotUnit) ? altInPilotUnit : maxAltitude;

            return { altitude, altInPilotUnit, lat, lng, airtimeInSeconds, timeInSeconds };
        });

        const lastRecord = parsedFixedRecords[parsedFixedRecords.length - 1];
        const airtimeInMinutes = Math.round(lastRecord.airtimeInSeconds / 60);

        return {
            flightPoints: parsedFixedRecords,
            maxAltitude: maxAltitude,
            airtime: airtimeInMinutes
        };
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
        const timeInSeconds = hours * 3600 + minutes * 60 + seconds;
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
            lat: this.getDecimalDegreeFromDmsString(BRecord.substr(7, 8), true),
            lng: this.getDecimalDegreeFromDmsString(BRecord.substr(15, 9))
        };
    },

    /**
     * Latitude format: ddmmtttD, longitude format: dddmmtttD, where d – degree digits, m – minutes digits,
     * t – represents tenths, hundredths and thousandths of minutes, D – N/S/W/E.
     * @param {string} dmsString – B record partial corresponding to lat or lng in DMS format.
     * @param {Boolean} [isLatitude] – Whether dms string is latitude.
     * @return {number} – lat or lng in decimal degree coordinate system.
     */
    getDecimalDegreeFromDmsString(dmsString, isLatitude = false) {
        const degreeDigits = isLatitude ? 2 : 3;
        const degree = Number(dmsString.substr(0, degreeDigits));
        const minutes = Number(dmsString.substr(2, 2) + '.' + dmsString.substr(4, 3));
        let decimalDegree = degree + minutes / 60;

        const negativeCardinalDirection = isLatitude ? 'S' : 'W';
        if (dmsString.substr(7) === negativeCardinalDirection) {
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
    }
};

module.exports = igcService;
