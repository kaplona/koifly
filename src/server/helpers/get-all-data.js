'use strict';

var _ = require('lodash');

var ErrorTypes = require('../../errors/error-types');
var KoiflyError = require('../../errors/error');
var getPilotValuesForFrontend = require('./get-pilot-values');
const SCOPES = require('../../constants/orm-constants').SCOPES;

var Flight = require('../../orm/flights');
var Site = require('../../orm/sites');
var Glider = require('../../orm/gliders');



/**
 * @param {object} pilot - sequelize pilot instance
 * @param {string|null} dateFrom - If provided, only changes since that date are returned
 * @returns {Promise.<{pilot: Object, flights: Object, sites: Object, gliders: Object, lastModified: string}>}
 * lastModified - is the date of last modification in DB
 */
var getAllData = function(pilot, dateFrom) {
    // DEV
    console.log('=> retrieving all data');

    var result = {};

    // If no dateFrom => it's first request from the user, so retrieve all data
    var scope = dateFrom ? SCOPES.all : SCOPES.visible;

    // We are sending all the data to the browser along with the latest date at which DB records were modified
    // So front-end can compare it with the latest date it has in its store
    // And update data if needed
    var maxLastModified = pilot.updatedAt;

    var whereQuery = { pilotId: pilot.id };
    if (dateFrom) {
        whereQuery.updatedAt = { $gt: dateFrom };
        maxLastModified = dateFrom > maxLastModified ? dateFrom : maxLastModified;
    }

    // Promise.all resolves only if every promises in the given list resolves
    return Promise
        .all([
            // parallel asynchronous requests
            Flight.scope(scope).findAll({ where: whereQuery }),
            Site.scope(scope).findAll({ where: whereQuery }),
            Glider.scope(scope).findAll({ where: whereQuery })
        ])
        .then((recordsSet) => {
            // Values appear in the same order as we requested for them
            result.flights = getRecordsValues(recordsSet[0]);
            result.sites = getRecordsValues(recordsSet[1]);
            result.gliders = getRecordsValues(recordsSet[2]);

            // Find the latest updating date of all records
            _.each(result, (records, dataType) => {
                _.each(records, (record) => {
                    maxLastModified = (record.updatedAt > maxLastModified) ? record.updatedAt : maxLastModified;
                });
            });

            result.lastModified = maxLastModified;
            result.pilot = getPilotValuesForFrontend(pilot);

            return result;
        })
        .catch (() => {
            throw new KoiflyError(ErrorTypes.DB_READ_ERROR);
        });
};



/**
 * @param {Object[]} sequelizeRecordInstances - DB records set
 * @returns {Object[]} array of DB records with plain values
 * or in case of deleted instance just its id and deleted date
 * Note: this method was designed for use with sequelize record instances
 * which can be deleted (have property 'see')
 * don't use it for pilot records
 */
function getRecordsValues(sequelizeRecordInstances) {
    return _.map(sequelizeRecordInstances, function(record) {
        // If instance was deleted
        // user doesn't need its content
        if (!record.see) {
            return {
                id: record.id,
                see: false,
                updatedAt: record.updatedAt
            };
        }
        // {plain = true} will only return the values of sequelize record instance
        // (omits sequelize methods and additional stuff)
        return record.get({ plain: true });
    });
}


module.exports = getAllData;
