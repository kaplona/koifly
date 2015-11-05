'use strict';

var _ = require('underscore');
var sequelize = require('../orm/sequelize');
var Flight = require('../orm/flights');
var Site = require('../orm/sites');
var Glider = require('../orm/gliders');
var Pilot = require('../orm/pilots');


sequelize.sync();

// TODO error classes or list with all error msg

function getPilot() {
    // TODO retrieve everything except password
    return Pilot.findById(1);
}


function getAllData(pilot, dateFrom) {
    // If no dateFrom => it's first request from the user, so retrieve only active data (where see = true)
    var scope = dateFrom ? null : 'see';

    // TODO check dateFrom is actual date
    // If no dateFrom => take arbitrary early date
    dateFrom = dateFrom ? dateFrom : '1900-01-01 00:00:00';

    // We already have our first data for user: pilot info
    pilot = pilot.get({ plain: true });
    var dbData = {
        pilot: pilot
    };

    var lastModified = [ dateFrom, pilot.updatedAt ];
    var whereQuery = { pilotId: pilot.id, updatedAt: { $gt: dateFrom } };

    // Promise.all resolves only if every promises in the given list resolves
    return Promise.all([
        // parallel asynchronous requests
        Flight.scope(scope).findAll({ where: whereQuery }),
        Site.scope(scope).findAll({ where: whereQuery }),
        Glider.scope(scope).findAll({ where: whereQuery })
    ]).then((values) => {
        // Values is the list of each promise's respond
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
    });
}


function takeOnlyPlainValues(bdInstances) {
    for (var i = 0; i < bdInstances.length; i++) {
        bdInstances[i] = bdInstances[i].get({ plain: true });
        // If instance was deleted => it's the only information user needs to know about it
        if (bdInstances[i].see === false) {
            bdInstances[i] = { id: bdInstances[i].id, see: false }
        }
    }
    return bdInstances;
}


//{
//    name: 'SequelizeValidationError',
//    message: 'notNull Violation: airtime cannot be null',
//    errors:
//    [ { message: 'airtime cannot be null',
//        type: 'notNull Violation',
//        path: 'airtime',
//        value: null } ]
//}


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
        return Flight.findById(data.id).then((flight) => {
            if (flight === null) {
                throw '=> no such record in db';
            }

            if (flight.getDataValue('pilotId') !== pilotId) {
                throw '=> error: you do not have permission to change this record';
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
        return Site.findById(data.id).then((site) => {
            if (site === null) {
                throw '=> no such record in db';
            }

            if (site.getDataValue('pilotId') !== pilotId) {
                throw '=> error: you do not have permission to change this record';
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
        return Glider.findById(data.id).then((glider) => {
            if (glider === null) {
                throw '=> no such record in db';
            }

            if (glider.getDataValue('pilotId') !== pilotId) {
                throw '=> you do not have permission to change this record';
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
    // Authentication
    // TODO need to pass cookie or something as a parameter
    getPilot().then((pilot) => {
        if (pilot === null) {
            throw '=> not authorised pilot => END';
        }
        //DEV
        // console.log('pilot info => ', pilot.get({ plain: true }));

        if (request.method === 'get') {
            return getAllData(pilot, JSON.parse(request.query.lastModified));
        }

        if (request.method === 'post') {
            // If data type is not specified
            if (_.indexOf(['flight', 'site', 'glider', 'pilot'], request.payload.dataType) === -1) {
                throw '=> dataType is not valid => END';
            } else {
                var data = JSON.parse(request.payload.data);
                //DEV only
                console.log('raw data => ', data);

                return saveData(request.payload.dataType, data, pilot).then(() => {
                    // Get all data from the DB since lastModified
                    return getAllData(pilot, request.payload.lastModified);
                });
            }
        }
    }).then((dbData) => {
        reply(JSON.stringify(dbData));
    }).catch((e) => {
        //DEV
        console.log('error => ');
        console.log(e);

        reply(JSON.stringify({ error: e }));
    });
};


module.exports = QueryHandler;
