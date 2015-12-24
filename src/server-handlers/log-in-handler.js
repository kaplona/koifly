'use strict';

var sequelize = require('../orm/sequelize');
var BcryptPromise = require('../utils/bcrypt-promise');
var SetCookie = require('./helpers/set-cookie');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var NormalizeError = require('../utils/error-normalize');
var GetAllData = require('./helpers/get-all-data');
var Pilot = require('../orm/pilots');


sequelize.sync();


var LogInHandler = function(request, reply) {
    var pilot; // we need it to have reference to current pilot
    var credentials = JSON.parse(request.payload);

    Pilot.findOne({ where: { email: credentials.email } }).then((pilotRecord) => {
        if (pilotRecord === null) {
            throw new KoiflyError(ErrorTypes.AUTHENTICATION_FAILURE);
        }
        pilot = pilotRecord;
        // Compare password provided by user with the one we have in DB
        return BcryptPromise.compare(credentials.password, pilot.password);
    }).then((isEqual) => {
        if (!isEqual) {
            throw new KoiflyError(ErrorTypes.AUTHENTICATION_FAILURE);
        }

        SetCookie(request, pilot.id, pilot.password);

        // Log in was successful
        // Reply with all user's data
        return GetAllData(pilot, null);
    }).then((dbData) => {
        reply(JSON.stringify(dbData));
    }).catch((error) => {
        reply(JSON.stringify({ error: NormalizeError(error) }));
    });
};


module.exports = LogInHandler;
