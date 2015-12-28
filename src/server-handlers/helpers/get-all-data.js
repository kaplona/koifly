'use strict';

var _ = require('lodash');
var KoiflyError = require('../../utils/error');
var ErrorTypes = require('../../utils/error-types');
var SanitizePilotInfo = require('./sanitize-pilot-info');
var Flight = require('../../orm/flights');
var Site = require('../../orm/sites');
var Glider = require('../../orm/gliders');


/**
 *
 * @param {array} bdInstances
 * @returns {array} array of DB records with plain values
 * or in case of deleted instance just its id and deleted date
 */
function takeOnlyPlainValues(bdInstances) {
    return _.map(bdInstances, function(instance) {
        // If instance was deleted
        // user doesn't need its content
        if (instance.see === false) {
            return {
                id: instance.id,
                see: false,
                updatedAt: instance.updatedAt
            };
        }
        return instance.get({ plain: true });
    });
}


/**
 *
 * @param {object} pilot - sequelize DB pilot object
 * @param {string} dateFrom - DB will be searched for every recorded which was modified after this date
 * @returns {Promise.<object>} - object with next fields: pilot, flights, sites, gliders, lastModified
 * lastModified - is the date of last modification in DB
 * @constructor
 */
var GetAllData = function(pilot, dateFrom) {
    // If no dateFrom =>
    // it's first request from the user
    // so retrieve only active data (where see = true)
    var scope = dateFrom ? null : 'see';

    // TODO check dateFrom is actual date
    // If no dateFrom, so take arbitrary early date
    dateFrom = dateFrom ? dateFrom : '1900-01-01 00:00:00';

    // We already have our first data for user: pilot info
    pilot = SanitizePilotInfo(pilot);
    var dbData = {
        pilot: pilot
    };

    // Create a list with last modified dates for each data type
    // Then just send the max date to user
    var lastModified = [ dateFrom, pilot.updatedAt ];
    var whereQuery = { pilotId: pilot.id, updatedAt: { $gt: dateFrom } };

    // Promise.all resolves only if every promises in the given list resolves
    return Promise.all([
        // parallel asynchronous requests
        Flight.scope(scope).findAll({ where: whereQuery }),
        Site.scope(scope).findAll({ where: whereQuery }),
        Glider.scope(scope).findAll({ where: whereQuery })
    ]).then((values) => {
        // Values is the list of each promise return value
        for (var i = 0; i < values.length; i++) {
            values[i] = takeOnlyPlainValues(values[i]);

            // Find the latest updated date in the instance
            if (!_.isEmpty(values[i])) {
                var lastModifiedValue = _.max(values[i], (value) => {
                    return value.updatedAt;
                });
                lastModified.push(lastModifiedValue.updatedAt);
            }
        }

        // Values appear in the same order as we requested for them
        dbData.flights = values[0];
        dbData.sites = values[1];
        dbData.gliders = values[2];

        // Take the latest updated date among instances
        dbData.lastModified = _.max(lastModified);

        return dbData;
    }).catch (() => {
        throw new KoiflyError(ErrorTypes.RETRIEVING_FAILURE);
    });
};


module.exports = GetAllData;
