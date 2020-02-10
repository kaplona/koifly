/* eslint-disable no-use-before-define */
/* since I define helpers functions which are not invoked in this file  */
import Altitude from '../../utils/altitude';
import db from '../../orm/sequelize-db';
import errorTypes from '../../errors/error-types';
import KoiflyError from '../../errors/error';
import normalizeError from '../../errors/normalize-error';
import ormConstants from '../../constants/orm-constants';

import Glider from '../../orm/models/gliders';
import Flight from '../../orm/models/flights';
import Pilot from '../../orm/models/pilots';
import Site from '../../orm/models/sites';

// Can't switch to csvtojson version ^2 because they introduced Promise syntax but they don't use real Promises.
// Their updated "fromString" method returns a then-able object – an object with "then" method on it,
// so I can't chain promises or catch errors.
const Converter = require('csvtojson').Converter;

/**
 * Parses csv data and saves it into DB.
 * If import succeeds will reply with SuccessCounts object which contains numbers of how many rows were added to the DB.
 * If any row fails import will reply with list of ValidationErrors objects which contains row index and error occurred.
 *
 * @typedef {Object} ImportFlightRow
 * @property {string} date – Date in yyyy-mm-dd format.
 * @property {number} airtime
 * @property {number} altitude
 * @property {string} site – Name of a site.
 * @property {number} launchAltitude – Site launch altitude.
 * @property {string} location – Site geographical location, e.g. country, province, town.
 * @property {number} latitude – Site coordinates latitude.
 * @property {number} longitude – Site coordinates longitude.
 * @property {string} glider – Name of a glider.
 * @property {string} remarks
 *
 * @typedef {Object} SuccessCounts
 * @property {number} flightsNum
 * @property {number} sitesNum
 * @property {number} glidersNum
 *
 * @typedef {Object} ValidationErrors
 * @property {number} row – Index of a row where error occurred.
 * @property {KoiflyError} error
 *
 * @param {Object} request
 */
function importFlightsHandler(request) {
  const pilotId = request.auth.credentials.userId;

  // Parse base64 encoded csv file content into utf8 string
  const encodedCsvString = request.payload.encodedContent.replace('data:text/csv;base64,', '');
  const csvString = new Buffer(encodedCsvString, 'base64').toString('utf8');

  // When import succeeds we reply with numbers of added records to the DB.
  const counts = {
    flightsNum: 0,
    sitesNum: 0,
    glidersNum: 0
  };

  // We will iterate over all csv rows and saves encountered validation errors in this list. We will save records to
  // the DB only if this list is empty. Otherwise we respond with this list in order for client to learn which csv rows
  // they need to correct.
  const validationErrors = [];

  return Promise
    .all([
      convertCsvToJson(csvString),
      getPilotUnit(pilotId),
      getRecordsNameHashMap(Site, pilotId),
      getRecordsNameHashMap(Glider, pilotId)
    ])
    .then(result => {
      const rows = result[0];
      const altitudeUnit = result[1];
      // Name to existing sequelize record hash map. In import data all sites and gliders are referenced by name,
      // so this hash map will be user to check whether new flight's glider/site existed previously in the DB.
      const sitesHashMap = result[2];
      const glidersHashMap = result[3];

      // For each csv file row save new flight, glider, and site (if they didn't exist) in one transaction.
      return db.transaction(transactionId => {
        // We need to save each row data sequentially in order to correctly add new sites and gliders to the DB.
        let lastPromise = Promise.resolve();
        rows.forEach((row, index) => {
          lastPromise = lastPromise.then(() => {
            return saveRow(row, index, pilotId, glidersHashMap, sitesHashMap, validationErrors, counts, transactionId, altitudeUnit);
          });
        });

        // If we encountered any validation error throw Koifly validation error, thus cancelling transaction.
        return lastPromise.then(() => {
          if (validationErrors.length) {
            throw new KoiflyError(errorTypes.VALIDATION_ERROR);
          }
          return Promise.resolve();
        });
      });
    })
    .then(() => {
      return JSON.stringify(counts);
    })
    .catch(error => {
      const normalisedError = normalizeError(error);

      // If we encountered validation error, reply with list of validation errors.
      if (normalisedError.type === errorTypes.VALIDATION_ERROR) {
        return { error: validationErrors };
      }
      // if we encountered csv file parsing error and know lines with errors, reply with list of these errors.
      if (normalisedError.type === errorTypes.FILE_IMPORT_ERROR && normalisedError.errors.length) {
        return { error: normalisedError.errors };
      }
      // Otherwise reply with generic Koifly error.
      return { error: normalisedError };
    });
}

/**
 * Takes csv file insides as string and converts it into list of objects, where key of each object is csv file header,
 * and value of each object is a corresponding to that header cell value.
 * @param {string} csvString
 * @return {Promise.<Array.<ImportFlightRow>|KoiflyError>}
 */
function convertCsvToJson(csvString) {
  const csvConverter = new Converter({
    // If `checkColumn` is true, converter doesn't ignore empty columns. Uncomment when this issue is resolved:
    // @see https://github.com/Keyang/node-csvtojson/issues/231
    // checkColumn: true,
    checkType: false,
    delimiter: [',', ';'],
    flatKeys: true,
    ignoreEmpty: true
  });

  return new Promise((resolve, reject) => {
    csvConverter.fromString(csvString, (err, res) => {
      if (res && !err) {
        resolve(res);
        return;
      }

      // If scv file parsing failed – reject Promise with special KoiflyError. If we know line and type of
      // an error – pass it to KoiflyError constructor.
      const errors = [];
      const csvToJsonErrorMessages = {
        column_mismatched: 'A file line has more (or less) columns than file header.', // eslint-disable-line camelcase
        unclosed_quote: 'There is an unclosed quote in a line.' // eslint-disable-line camelcase
      };
      if (err.err && (err.line || err.line === 0)) {
        errors.push({
          row: err.line + 1,
          error: new KoiflyError(errorTypes.VALIDATION_ERROR, csvToJsonErrorMessages[err.err])
        });
      }

      reject(new KoiflyError(errorTypes.FILE_IMPORT_ERROR, null, errors));
    });
  });
}

/**
 * Returns current user altitude unit, e.g. "meters", "feet".
 * @param {string|number} pilotId
 * @return {Promise<string>}
 */
function getPilotUnit(pilotId) {
  return Pilot.findByPk(pilotId).then(pilot => pilot.altitudeUnit);
}

/**
 * Fetches records for given Model and pilot id.
 * Returns object with orm instances where keys are modified record name.
 * @param {Object} Model – Sequelize model.
 * @param {number|string} pilotId
 * @param {Object} options – Options to pass to orm query.
 * @return {Promise.<Object>}
 */
function getRecordsNameHashMap(Model, pilotId, options = {}) {
  const hashMap = {};

  const queryOptions = Object.assign({}, options, {
    where: { pilotId: pilotId }
  });

  return Model
    .scope(ormConstants.SCOPES.visible)
    .findAll(queryOptions)
    .then(records => {
      records.forEach(record => {
        const key = convertNameToKey(record.name);
        hashMap[key] = record;
      });
      return hashMap;
    });
}

/**
 * In order to use sites and gliders names as object keys we need to replace all spaces with underscores.
 * Also makes name lowercase, so name comparison could be case insensitive.
 * @param {string} name
 * @return {string}
 */
function convertNameToKey(name) {
  return name.toLowerCase().replace(/\s/g, '_');
}

/**
 * Separates row data related to flight, site, or glider, and saves new record if needed.
 * @param {ImportFlightRow} row
 * @param {number} rowIndex
 * @param {number|string} pilotId
 * @param {Object} glidersHashMap
 * @param {Object} sitesHashMap
 * @param {Array.<ValidationError>} validationErrors
 * @param {SuccessCounts} successCounts
 * @param {string} transactionId
 * @param {string} altitudeUnit – Current pilot altitude unit.
 * @return {Promise<void>}
 */
function saveRow(row, rowIndex, pilotId, glidersHashMap, sitesHashMap, validationErrors, successCounts, transactionId, altitudeUnit) {
  const newFlight = composeFlight(row, pilotId, glidersHashMap, sitesHashMap, altitudeUnit);
  const newSite = composeSite(row, pilotId, altitudeUnit);
  const newGlider = composeGlider(row, pilotId);

  return saveGlider(newGlider, glidersHashMap, transactionId)
    .catch(error => saveValidationError(error, rowIndex, validationErrors))
    .then(glider => {
      if (!glider) {
        return;
      }

      newFlight.gliderId = glider.id;
      successCounts.glidersNum++;


      // Add newly created glider to gliders name hash map, so if we encounter a row with the same
      // glider name we won't save it twice.
      const gliderNameKey = convertNameToKey(glider.name);
      glidersHashMap[gliderNameKey] = glider;
    })
    .then(() => saveSite(newSite, sitesHashMap, transactionId))
    .catch(error => saveValidationError(error, rowIndex, validationErrors))
    .then(site => {
      if (!site) {
        return;
      }

      newFlight.siteId = site.id;
      successCounts.sitesNum++;

      // Add newly created site to sites name hash map, so if we encounter a row with the same
      // site name we won't save it twice.
      const siteNameKey = convertNameToKey(site.name);
      sitesHashMap[siteNameKey] = site;
    })
    .then(() => saveFlight(newFlight, transactionId))
    .catch(error => saveValidationError(error, rowIndex, validationErrors))
    .then(() => {
      successCounts.flightsNum++;
    });
}

/**
 * Extracts data for new flight from csv row. If glider/site name presents in hash map, also saves glider/site id to
 * a new record.
 * @param {Object} row – Object which represents a csv row.
 * @param {string|number} pilotId
 * @param {Object} glidersHashMap – Name to existing orm glider instance hash map.
 * @param {Object} sitesHashMap – Name to existing orm site instance hash map.
 * @param {string} altitudeUnit – Current pilot altitude unit.
 * @return {Object}
 */
function composeFlight(row, pilotId, glidersHashMap, sitesHashMap, altitudeUnit) {
  const gliderKey = row.glider ? convertNameToKey(row.glider) : null;
  const glider = gliderKey ? glidersHashMap[gliderKey] : null;
  const gliderId = glider ? glider.id : null;

  const siteKey = row.site ? convertNameToKey(row.site) : null;
  const site = siteKey ? sitesHashMap[siteKey] : null;
  const siteId = site ? site.id : null;

  return {
    date: row.date,
    airtime: row.airtime,
    altitude: Altitude.convertAltitudeToMeters(row.altitude || 0, altitudeUnit),
    remarks: row.remarks,
    pilotId: pilotId,
    gliderId: gliderId,
    siteId: siteId
  };
}

/**
 * Extracts data for new site from csv row.
 * @param {Object} row – Object which represents a csv row.
 * @param {string|number} pilotId
 * @param {string} altitudeUnit – Current pilot altitude unit.
 * @return {Object}
 */
function composeSite(row, pilotId, altitudeUnit) {
  return {
    name: row.site,
    launchAltitude: Altitude.convertAltitudeToMeters(row.launchAltitude || 0, altitudeUnit),
    location: row.location,
    lat: row.latitude,
    lng: row.longitude,
    pilotId: pilotId
  };
}

/**
 * Extracts data for new glider from csv row.
 * @param {Object} row – Object which represents a csv row.
 * @param {string|number} pilotId
 * @return {Object}
 */
function composeGlider(row, pilotId) {
  return {
    name: row.glider,
    pilotId: pilotId
  };
}

function saveFlight(newFlight, transaction) {
  return Flight.create(newFlight, { transaction: transaction });
}

function saveGlider(newGlider, glidersHashMap, transaction) {
  return saveRecord(Glider, newGlider, glidersHashMap, transaction);
}

function saveSite(newSite, sitesHashMap, transaction) {
  return saveRecord(Site, newSite, sitesHashMap, transaction);
}

/**
 * Checks whether name of a new record already exists in namesHashMap and if not – saves new record to DB.
 * @param {Object} Model – Sequelize model.
 * @param {Object} newRecord – Object containing data for creating an orm model instance.
 * @param {Object} namesHashMap – Name to existing sequelize instance hash map.
 * @param {*} transaction – Transaction id.
 * @return {Promise.<Object|null>} – Promise resolved with new orm instance or null, if such record already exists.
 */
function saveRecord(Model, newRecord, namesHashMap, transaction) {
  const nameKey = newRecord.name && convertNameToKey(newRecord.name);
  if (!nameKey || namesHashMap[nameKey]) {
    return Promise.resolve(null);
  }

  return Model.create(newRecord, { transaction: transaction });
}

/**
 * Converts error into Koifly error, and adds encountered validation error to the list of errors.
 * If error is not validation error, throws DB write error.
 * @param {Error|Object} error – An error occurred.
 * @param {number} rowIndex – Index of a row where error occurred.
 * @param {Array.<{row: number, error: KoiflyError}>} validationErrors – Reference to list with validation errors.
 */
function saveValidationError(error, rowIndex, validationErrors) {
  const normalisedError = normalizeError(error);
  if (normalisedError.type !== errorTypes.VALIDATION_ERROR) {
    throw new KoiflyError(errorTypes.DB_WRITE_ERROR);
  }

  // TODO merge all messages for one row into one record
  validationErrors.push({
    row: rowIndex + 1, // since indexes start with `0`
    error: normalisedError
  });
}


export default importFlightsHandler;
