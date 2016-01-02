'use strict';

var _ = require('lodash');
var sequelize = require('../orm/sequelize');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var NormalizeError = require('../utils/error-normalize');
var GetAllData = require('./helpers/get-all-data');
var Flight = require('../orm/flights');
var Site = require('../orm/sites');
var Glider = require('../orm/gliders');
var Pilot = require('../orm/pilots');


sequelize.sync();


/**
 *
 * @param {string} dataType
 * @param {object} data
 * @param {object} pilot - sequelize instance
 * @returns {Promise}
 */
function saveData(dataType, data, pilot) {
    var pilotId = pilot.getDataValue('id');
    switch (dataType) {
        case 'flight':
            return saveFlight(data, pilotId);
        case 'site':
            return saveSite(data, pilotId);
        case 'glider':
            return saveGlider(data, pilotId);
        case 'pilot':
            return savePilotInfo(data, pilot);
    }
}


/**
 * @param {object} data
 * @param {integer} pilotId
 * @returns {Promise}
 */
function saveFlight(data, pilotId) {
    // Make sure that we updating the information that user is allowed to update
    if (data.see === 0) {
        data = {
            id: data.id,
            see: 0
        }
    } else {
        data = {
            id: data.id,
            date: data.date,
            siteId: data.siteId,
            altitude: data.altitude,
            airtime: data.airtime,
            gliderId: data.gliderId,
            remarks: data.remarks
        };
    }

    if (data.id === undefined) {
        data.pilotId = pilotId;
        return Flight.create(data);
    }

    return Flight.findOne({ where: { id: data.id, pilotId: pilotId } }).then((flight) => {
        if (!flight || flight.id !== data.id) {
            throw new KoiflyError(ErrorTypes.NO_EXISTENT_RECORD);
        }

        return flight.update(data);
    });
}


/**
 * @param {object} data
 * @param {integer} pilotId
 * @returns {Promise}
 */
function saveSite(data, pilotId) {
    // Make sure that we updating the information that user is allowed to update
    if (data.see === 0) {
        data = {
            id: data.id,
            see: 0
        }
    } else {
        data = {
            id: data.id,
            name: data.name,
            location: data.location,
            launchAltitude: data.launchAltitude,
            coordinates: data.coordinates,
            remarks: data.remarks
        };
    }

    if (data.id === undefined) {
        data.pilotId = pilotId;
        return Site.create(data);
    }

    return Site.findOne({ where: { id: data.id, pilotId: pilotId } }).then((site) => {
        if (!site || site.id !== data.id) {
            throw new KoiflyError(ErrorTypes.NO_EXISTENT_RECORD);
        }

        // TODO transactions
        return site.update(data);
    }).then((newSite) => {
        if (newSite.getDataValue('see') === false) {
            return Flight.update({ siteId: null }, {where: {siteId: newSite.id} });
        }
    });
}


/**
 * @param {object} data
 * @param {integer} pilotId
 * @returns {Promise}
 */
function saveGlider(data, pilotId) {
    // Make sure that we updating the information that user is allowed to update
    if (data.see === 0) {
        data = {
            id: data.id,
            see: 0
        }
    } else {
        data = {
            id: data.id,
            name: data.name,
            initialFlightNum: data.initialFlightNum,
            initialAirtime: data.initialAirtime,
            remarks: data.remarks
        };
    }

    if (data.id === undefined) {
        data.pilotId = pilotId;
        return Glider.create(data);
    }

    return Glider.findOne({ where: { id: data.id, pilotId: pilotId } }).then((glider) => {
        if (!glider || glider.id !== data.id) {
            throw new KoiflyError(ErrorTypes.NO_EXISTENT_RECORD);
        }

        // TODO transactions
        return glider.update(data);
    }).then((newGlider) => {
        if (newGlider.getDataValue('see') === false) {
            return Flight.update({ gliderId: null }, {where: {gliderId: newGlider.id} });
        }
    });
}


/**
 * @param {object} data - field names and new values to be updated
 * @param {object} pilot - sequelize DB instance to update
 * @returns {Promise.<pilot>} - pilot is sequelize DB instance
 */
function savePilotInfo(data, pilot) {
    // Make sure that we updating the information that user is allowed to update
    data = {
        userName: data.userName,
        initialFlightNum: data.initialFlightNum,
        initialAirtime: data.initialAirtime,
        altitudeUnit: data.altitudeUnit
    };

    return pilot.update(data);
}


/**
 * Saves data in case of POST request
 * Replies with all user's data or error if the latest occurred
 * @param {object} request
 * @param {function} reply
 */
var QueryHandler = function(request, reply) {
    Pilot.findById(request.auth.credentials.userId).then((pilot) => {
        if (request.method === 'get') {
            // Get all data from the DB since lastModified
            return GetAllData(pilot, JSON.parse(request.query.lastModified));
        }

        if (request.method === 'post') {
            var requestPayload = JSON.parse(request.payload);

            // If data type is not specified throw error
            if (_.indexOf(['flight', 'site', 'glider', 'pilot'], requestPayload.dataType) === -1) {
                throw new KoiflyError(ErrorTypes.SAVING_FAILURE);
            }

            // If data is not an Object throw error
            if (!(requestPayload.data instanceof Object)) {
                throw new KoiflyError(ErrorTypes.SAVING_FAILURE);
            }

            return saveData(requestPayload.dataType, requestPayload.data, pilot).then(() => {
                // Get all data from the DB since lastModified
                return GetAllData(pilot, requestPayload.lastModified);
            });
        }
    }).then((dbData) => {
        reply(dbData);
    }).catch((err) => {
        //DEV
        console.log('error => ', err);

        reply({ error: NormalizeError(err) });
    });
};


module.exports = QueryHandler;
