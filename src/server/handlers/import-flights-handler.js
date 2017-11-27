'use strict';

const Converter = require('csvtojson').Converter;
const ErrorTypes = require('../../errors/error-types');
const KoiflyError = require('../../errors/error');
const normalizeError = require('../../errors/normalize-error');
const sequelize = require('../../orm/sequelize');

const Glider = require('../../orm/gliders');
const Flight = require('../../orm/flights');
const Site = require('../../orm/sites');
const SCOPES = require('../../constants/orm-constants').SCOPES;


function  importFlightsHandler(request, reply) {
    const pilotId = request.auth.credentials.userId;

    // Parse base64 encoded csv file content into utf8 string
    const encodedCsvString = request.payload.encodedContent.replace('data:text/csv;base64,', '');
    const csvString = new Buffer(encodedCsvString, 'base64').toString('utf8');

    // If import succeeds, counts will be returned, otherwise list of errors.
    const errors = [];
    const counts = {
        flightsNum: 0,
        sitesNum: 0,
        glidersNum: 0
    };

    let rows = [];
    let sitesHashMap = {};
    let glidersHashMap = {};

    Promise
        .all([
            convertCsvToJson(csvString),
            getRecordsNameHashMap(Site, pilotId),
            getRecordsNameHashMap(Glider, pilotId)
        ])
        .then(result => {
            rows = result[0];
            // Name to existing sequelize record hash map. In import data all sites and gliders are referenced by name,
            // so this hash map will be user to check whether new flight's glider/site existed previously in the DB.
            sitesHashMap = result[1];
            glidersHashMap = result[2];

            // For each csv file row save new flight, and additionally new glider and site if they didn't exist.
            return sequelize.transaction(t => {
                return Promise
                    .all(rows.map((row, rowIndex) => {
                        const newFlight = composeFlight(row, pilotId, glidersHashMap, sitesHashMap);
                        const newSite = composeSite(row, pilotId);
                        const newGlider = composeGlider(row, pilotId);

                        return saveGlider(newGlider, glidersHashMap, t)
                            .catch(error => saveValidationError(error, rowIndex))
                            .then(glider => {
                                if (!glider) {
                                    return;
                                }

                                newFlight.gliderId = glider.id;
                                counts.glidersNum++;


                                // Add newly created glider to gliders name hash map, so if we encounter a row with the same
                                // glider name we won't save it twice.
                                const gliderNameKey = convertNameToKey(glider.name);
                                glidersHashMap[gliderNameKey] = glider;
                            })
                            .then(() => saveSite(newSite, sitesHashMap, t))
                            .catch(error => saveValidationError(error, rowIndex))
                            .then(site => {
                                if (!site) {
                                    return;
                                }

                                newFlight.siteId = site.id;
                                counts.sitesNum++;

                                // Add newly created site to sites name hash map, so if we encounter a row with the same
                                // site name we won't save it twice.
                                const siteNameKey = convertNameToKey(site.name);
                                glidersHashMap[siteNameKey] = site;
                            })
                            .then(() => saveFlight(newFlight, t))
                            .catch(error => saveValidationError(error, rowIndex))
                            .then(() => {
                                counts.flightsNum++;
                            })
                    }))
                    .then(() => {
                        // If we encountered any validation error throw Koifly validation error, thus cancelling
                        // transaction.
                        if (errors.length) {
                            throw new KoiflyError(ErrorTypes.VALIDATION_ERROR);
                        }

                        return Promise.resolve();
                    });
            });
        })
        .then(() => {
            reply(JSON.stringify(counts));
        })
        .catch(error => {
            const normalisedError = normalizeError(error);
            if (normalisedError.type === ErrorTypes.VALIDATION_ERROR) {
                console.log('-------> Validation Error', errors);
                reply({ error: errors });
            } else {
                console.log('-------> Error', error);
                reply({ error: normalisedError });
            }
        });

    /**
     * Converts error into Koifly error, and adds encountered validation error to the list of errors.
     * If error is not validation error, throws DB write error.
     * @param {Error|Object} error – An error occurred.
     * @param {number} rowIndex – Index of a row where error occurred.
     */
    function saveValidationError(error, rowIndex) {
        const normalisedError = normalizeError(error);
        if (normalisedError.type !== ErrorTypes.VALIDATION_ERROR) {
            throw new KoiflyError(ErrorTypes.DB_WRITE_ERROR);
        }

        // TODO merge all messages for one row into one record
        errors.push({
            row: rowIndex + 1, // since indexes start with `0`
            message: normalisedError
        });
    }
}


/**
 * Takes csv file insides as string and converts it into list of objects, where key of each object is csv file header,
 * and value of each object is a corresponding to that header cell value.
 * @param {string} csvString
 * @return {Promise}
 */
function convertCsvToJson(csvString) {
    const csvConverter = new Converter({
        delimiter: [',', ';', ' '],
        flatKeys: true,
        checkType: false
    });

    return new Promise((resolve, reject) => {
        csvConverter.fromString(csvString, function(err, res){
            if (res && !err) {
                resolve(res);
                return;
            }

            reject(err);
        });
    });
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
        .scope(SCOPES.visible)
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
 * Extracts data for new flight from csv row. If glider/site name presents in hash map, also saves glider/site id to
 * a new record.
 * @param {Object} row – Object which represents a csv row.
 * @param {string|number} pilotId
 * @param {Object} glidersHashMap – Name to existing orm glider instance hash map.
 * @param {Object} sitesHashMap – Name to existing orm site instance hash map.
 * @return {Object}
 */
function composeFlight(row, pilotId, glidersHashMap, sitesHashMap) {
    const gliderKey = row.glider ? convertNameToKey(row.glider) : null;
    const glider = gliderKey ? glidersHashMap[gliderKey] : null;
    const gliderId = glider ? glider.id : null;

    const siteKey = row.site ? convertNameToKey(row.site) : null;
    const site = siteKey ? sitesHashMap[siteKey] : null;
    const siteId = site ? site.id : null;

    return {
        date: row.date,
        airtime: row.airtime,
        altitude: row.altitude,
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
 * @return {Object}
 */
function composeSite(row, pilotId) {
    return {
        name: row.site,
        launchAltitude: row.launchAltitude,
        location: row.location,
        coordinates: row.coordinates,
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


module.exports = importFlightsHandler;
