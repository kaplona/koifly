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
    return Pilot.findById(1);
}


function getAllData(pilot, dateFrom) {
    // TODO check dateFrom is actual date
    var scope = dateFrom ? null : 'see';
    dateFrom = dateFrom ? dateFrom : '1900-01-01 00:00:00';
    // DEV
    console.log('last modified =>');
    console.log(dateFrom);
    console.log('current scope =>');
    console.log(scope);

    pilot = pilot.get({ plain: true });
    var dbData = {
        pilot: pilot
    };
    var lastModified = [ dateFrom, pilot.updatedAt ];
    // TODO find just required fields (except pilotId, updatedAt)
    return Flight.scope(scope).findAll({ where: { pilotId: pilot.id, updatedAt: { $gt: dateFrom } } })
        .then((flights) => {
            for (var i = 0; i < flights.length; i++) {
                flights[i] = flights[i].get({ plain: true });
                if (flights[i].see === false) {
                    flights[i] = { id: flights[i].id, see: false }
                }
            }
            dbData.flights = flights;
            if (!_.isEmpty(flights)) {
                var lastModifiedFlight = _.max(flights, (flight) => {
                    return flight.updatedAt;
                });
                lastModified.push(lastModifiedFlight.updatedAt);
            }
        }).catch((e) => {
            dbData.flights = { error: e };
        }).then(() => {
            return Site.scope(scope).findAll({ where: { pilotId: pilot.id, updatedAt: { $gt: dateFrom } } });
        }).then((sites) => {
            for (var i = 0; i < sites.length; i++) {
                sites[i] = sites[i].get({ plain: true });
                if (sites[i].see === false) {
                    sites[i] = { id: sites[i].id, see: false }
                }
            }
            dbData.sites = sites;
            if (!_.isEmpty(sites)) {
                var lastModifiedSite = _.max(sites, (site) => {
                    return site.updatedAt;
                });
                lastModified.push(lastModifiedSite.updatedAt);
            }
        }).catch((e) => {
            dbData.sites = { error: e };
        }).then(() => {
            return Glider.scope(scope).findAll({ where: { pilotId: pilot.id, updatedAt: { $gt: dateFrom } } });
        }).then((gliders) => {
            for (var i = 0; i < gliders.length; i++) {
                gliders[i] = gliders[i].get({ plain: true });
                if (gliders[i].see === false) {
                    gliders[i] = { id: gliders[i].id, see: false }
                }
            }
            dbData.gliders = gliders;
            if (!_.isEmpty(gliders)) {
                var lastModifiedGlider = _.max(gliders, (glider) => {
                    return glider.updatedAt;
                });
                lastModified.push(lastModifiedGlider.updatedAt);
            }
        }).catch((e) => {
            dbData.gliders = { error: e };
        }).then(() => {
            dbData.lastModified = _.max(lastModified);
            return dbData;
        });
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


function saveFlight(data, pilotId) {
    if (data.id === undefined) {
        data.pilotId = pilotId;

        return Flight.create(data).then((flight) => {
            //DEV
            flight = flight.get({plain: true});
            console.log('insert data => ');
            console.log(flight);
        });
    }

    if (data.id !== undefined) {
        // TODO check what will be return if no instance with given id
        return Flight.findById(data.id).then((flight) => {
            if (flight === null) {
                throw '=> no such record in db';
            }
            //DEV
            console.log('=> ' + flight.getDataValue('pilotId') + ' vs ' + pilotId);

            if (flight.getDataValue('pilotId') !== pilotId) {
                throw '=> error: you do not have permission to change this record => END';
            }

            // TODO what if error occurs while update, will it be caught
            return flight.update(data).then((newFlight) => {
                //DEV
                newFlight = newFlight.get({plain: true});
                console.log('insert data => ');
                console.log(newFlight);
            });
        });
    }
}


function saveSite(data, pilotId) {
    if (data.id === undefined) {
        data.pilotId = pilotId;

        return Site.create(data).then((site) => {
            //DEV
            site = site.get({plain: true});
            console.log('insert data => ');
            console.log(site);
        });
    }

    if (data.id !== undefined) {
        return Site.findById(data.id).then((site) => {
            if (site === null) {
                throw '=> no such record in db';
            }
            //DEV
            console.log('=> ' + site.getDataValue('pilotId') + ' vs ' + pilotId);

            if (site.getDataValue('pilotId') !== pilotId) {
                throw '=> error: you do not have permission to change this record => END';
            }

            // TODO transactions
            return site.update(data);
        }).then((newSite) => {
            //DEV
            newSite = newSite.get({plain: true});
            console.log('insert data => ');
            console.log(newSite);

            if (newSite.see === false) {
                return Flight.update({ siteId: null }, {where: {siteId: newSite.id} });
            }
        })
    }
}


function saveGlider(data, pilotId) {
    if (data.id === undefined) {
        data.pilotId = pilotId;

        return Glider.create(data).then((glider) => {
            //DEV
            glider = glider.get({plain: true});
            console.log('insert data => ');
            console.log(glider);
        });
    }

    if (data.id !== undefined) {
        return Glider.findById(data.id).then((glider) => {
            if (glider === null) {
                throw '=> no such record in db';
            }
            //DEV
            console.log('=> ' + glider.getDataValue('pilotId') + ' vs ' + pilotId);

            if (glider.getDataValue('pilotId') !== pilotId) {
                throw '=> you do not have permission to change this record => END';
            }

            return glider.update(data).then((newGlider) => {
                //DEV
                newGlider = newGlider.get({plain: true});
                console.log('insert data => ');
                console.log(newGlider);

                // TODO transactions
                if (newGlider.see === false) {
                    return Flight.findAll({ where: { gliderId: newGlider.id } }).then((flights) => {
                        _.each(flights, (flight) => {
                            flight.update({ gliderId: null });
                        });
                    });
                }
            });
        });
    }
}


function savePilotInfo(data, pilot) {
    return pilot.update(data).then((newPilot) => {
        //DEV
        newPilot = newPilot.get({plain: true});
        console.log('insert data => ');
        console.log(newPilot);
    });
}


var QueryHandler = function(request, reply) {
    // Authentification
    // TODO need to pass coockie or something as a parameter
    getPilot().then((pilot) => {
        if (pilot === null) {
            throw '=> not authorised pilot => END';
        }
        //DEV
        console.log('pilot info => ', pilot.get({ plain: true }));

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
