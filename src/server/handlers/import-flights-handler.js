'use strict';

const Converter = require('csvtojson').Converter;
// const normalizeError = require('../../errors/normalize-error');
const sequelize = require('../../orm/sequelize');

const Glider = require('../../orm/gliders');
const Flight = require('../../orm/flights');
const Site = require('../../orm/sites');
const SCOPES = require('../../constants/orm-constants').SCOPES;



function  importFlightsHandler(request, reply) {
    const pilotId = request.auth.credentials.userId;
    const encodedCsvString = request.payload.encodedContent.replace('data:text/csv;base64,', '');
    const csvString = new Buffer(encodedCsvString, 'base64').toString('utf8');

    Promise
        .all([
            convertCsvToJson(csvString),
            getRecordsNameHashMap(Site, pilotId),
            getRecordsNameHashMap(Glider, pilotId)
        ])
        .then(result => {
            const rows = result[0];
            const sitesHashMap = result[1];
            const glidersHashMap = result[2];

            return composeNewData(rows, sitesHashMap, glidersHashMap, pilotId);
        })
        .then(newData => {
            return saveNewData(newData, pilotId);
        })
        .then(counts => {
            reply(JSON.stringify(counts));
        })
        .catch(error => {
            reply({ error: error });
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
 * Separates various types of data into their own lists (flights, sites, gliders).
 * @param {Array} rows – list of parsed csv rows.
 * @param {Object} sitesHashMap – Key to site orm instances object, where key is modified site name.
 * @param {Object} glidersHashMap – Key to glider orm instances object, where key is modified glider name.
 * @param {number|string} pilotId
 * @return {{newFlights: Array, newSites: Array, newGliders: Array}}
 */
function composeNewData(rows, sitesHashMap, glidersHashMap, pilotId) {
    const newSites = [];
    const newSiteKeys = [];
    const newGliders = [];
    const newGliderKeys = [];

    const newFlights = rows.map(row => {
        const newFlight = {
            date: row.date,
            airtime: row.airtime,
            altitude: row.altitude,
            remarks: row.remarks,
            pilotId: pilotId
        };

        const siteKey = row.site ? convertNameToKey(row.site) : null;
        if (siteKey) {
            if (sitesHashMap[siteKey]) {
                newFlight.siteId = sitesHashMap[siteKey].id;
            }

            if (!sitesHashMap[siteKey]) {
                newFlight.siteKey = siteKey;
            }

            if (!sitesHashMap[siteKey] && !newSiteKeys.includes(siteKey)) {
                newSiteKeys.push(siteKey);
                newSites.push({
                    name: row.site,
                    launchAltitude: row.launchAltitude,
                    location: row.location,
                    coordinates: row.coordinates,
                    pilotId: pilotId
                });
            }
        }

        const gliderKey = row.glider ? convertNameToKey(row.glider) : null;
        if (gliderKey) {
            if (glidersHashMap[gliderKey]) {
                newFlight.gliderId = glidersHashMap[gliderKey].id;
            }

            if (!glidersHashMap[gliderKey]) {
                newFlight.gliderKey = gliderKey;
            }

            if (!glidersHashMap[gliderKey] && !newGliderKeys.includes(gliderKey)) {
                newGliderKeys.push(gliderKey);
                newGliders.push({
                    name: row.glider,
                    pilotId: pilotId
                });
            }
        }

        return newFlight;
    });

    return { newFlights, newSites, newGliders };
}

/**
 * Saves new data in one transaction,
 * rolls it back if at least one record couldn't be saved.
 * New flights data is populated with newly created site and glider ids.
 * @param {Object} data
 *      @param {Array} data.newFlights
 *      @param {Array} data.newSites
 *      @param {Array} data.newGliders
 * @param {number|string} pilotId
 * @returns {Promise.<{flightsNum: number, sitesNum: number, glidersNum: number}>} – Counts, how many records were saved.
 */
function saveNewData(data, pilotId) {
    return sequelize.transaction(t => {
        // TODO validate new records first, test various incorrect data
        // TODO will sequelize return all failed validation errors?
        const counts = {
            flightsNum: 0,
            sitesNum: 0,
            glidersNum: 0
        };
        let sitesHashMap = {};
        let glidersHashMap = {};

        // Save all new sites and gliders first
        return Promise
            .all([
                Site.bulkCreate(data.newSites, { transaction: t }),
                Glider.bulkCreate(data.newGliders, { transaction: t })
            ])
            .then(result => {
                counts.sitesNum = result[0].length;
                counts.glidersNum = result[1].length;
            })
            .then(() => {
                // We need to query sites and gliders since `bulkCreate` method doesn't return newly created ids
                // for new records,
                // @see http://docs.sequelizejs.com/class/lib/model.js~Model.html#static-method-bulkCreate
                return Promise.all([
                    getRecordsNameHashMap(Site, pilotId, { transaction: t }),
                    getRecordsNameHashMap(Glider, pilotId, { transaction: t })
                ]);
            })
            .then(result => {
                sitesHashMap = result[0];
                glidersHashMap = result[1];
            })
            .then(() => {
                // Add ids of newly created sites and gliders to new flights.
                data.newFlights.forEach(flight => {
                    if (flight.siteKey) {
                        flight.siteId = sitesHashMap[flight.siteKey].id;
                        delete flight.siteKey;
                    }

                    if (flight.gliderKey) {
                        flight.gliderId = glidersHashMap[flight.gliderKey].id;
                        delete flight.gliderKey;
                    }
                });

                // Save all new flights
                return Flight.bulkCreate(data.newFlights, { transaction: t });
            })
            .then(newFlightRecords => {
                counts.flightsNum = newFlightRecords.length;

                return counts;
            });
    });
}


module.exports = importFlightsHandler;
