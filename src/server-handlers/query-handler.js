'use strict';

var _ = require('lodash');
var sequelize = require('../orm/sequelize');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var NormalizeError = require('../utils/error-normalize');
var GetAllData = require('./get-all-data');
var Flight = require('../orm/flights');
var Site = require('../orm/sites');
var Glider = require('../orm/gliders');
var Pilot = require('../orm/pilots');


sequelize.sync();


// must return a promise
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


// must return a promise
function saveFlight(data, pilotId) {
    if (data.id === undefined) {
        data.pilotId = pilotId;
        return Flight.create(data);
    }

    if (data.id !== undefined) {
        return Flight.findOne({ where: { id: data.id, pilotId: pilotId } }).then((flight) => {
            if (flight === null) {
                throw new KoiflyError(ErrorTypes.NO_EXISTENT_RECORD);
            }

            return flight.update(data);
        });
    }
}


// must return a promise
function saveSite(data, pilotId) {
    if (data.id === undefined) {
        data.pilotId = pilotId;
        return Site.create(data);
    }

    if (data.id !== undefined) {
        return Site.findOne({ where: { id: data.id, pilotId: pilotId } }).then((site) => {
            if (site === null) {
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
}


// must return a promise
function saveGlider(data, pilotId) {
    if (data.id === undefined) {
        data.pilotId = pilotId;
        return Glider.create(data);
    }

    if (data.id !== undefined) {
        return Glider.findOne({ where: { id: data.id, pilotId: pilotId } }).then((glider) => {
            if (glider === null) {
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
}


// must return a promise
function savePilotInfo(data, pilot) {
    return pilot.update(data);
}



var QueryHandler = function(request, reply) {
    Pilot.findById(request.auth.credentials.userId).then((pilot) => {

        if (request.method === 'get') {
            // Get all data from the DB since lastModified
            return GetAllData(pilot, JSON.parse(request.query.lastModified));
        }

        if (request.method === 'post') {
            if (!pilot.activated) {
                throw new KoiflyError(ErrorTypes.NOT_ACTIVATED_USER);
            }

            var requestPayload = JSON.parse(request.payload);

            // If data type is not specified throw error
            if (_.indexOf(['flight', 'site', 'glider', 'pilot'], requestPayload.dataType) === -1) {
                throw new KoiflyError(ErrorTypes.SAVING_FAILURE, 'dataType is not valid');
            }

            // If data is not an Object throw error
            if (!(requestPayload.data instanceof Object)) {
                throw new KoiflyError(ErrorTypes.SAVING_FAILURE, 'request data is not valid');
            }

            return saveData(requestPayload.dataType, requestPayload.data, pilot).then(() => {
                // Get all data from the DB since lastModified
                return GetAllData(pilot, requestPayload.lastModified);
            });
        }
    }).then((dbData) => {
        reply(JSON.stringify(dbData));
    }).catch((err) => {
        //DEV
        console.log('error => ', err);

        reply(JSON.stringify({ error: NormalizeError(err) }));
    });
};


module.exports = QueryHandler;
