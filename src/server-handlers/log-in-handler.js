'use strict';

var Bcrypt = require('bcrypt');
var sequelize = require('../orm/sequelize');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var NormalizeError = require('../utils/error-normalize');
var GetAllData = require('./get-all-data');
var Pilot = require('../orm/pilots');


sequelize.sync();


var LogInHandler = function(request, reply) {
    var credentials = JSON.parse(request.payload);

    Pilot.findOne({ where: { email: credentials.email } }).then((pilot) => {
        if (pilot === null) {
            throw new KoiflyError(ErrorTypes.AUTHENTICATION_FAILURE);
        }

        Bcrypt.compare(credentials.password, pilot.password, (err, res) => {
            if (res === true) {
                // TODO cookie
                GetAllData(pilot, null).then((dbData) => {
                    reply(JSON.stringify(dbData));
                }).catch((error) => {
                    reply(JSON.stringify({ error: NormalizeError(error) }));
                });
            }

            if (res === false) {
                reply(JSON.stringify({ error: new KoiflyError(ErrorTypes.AUTHENTICATION_FAILURE) }));
            }

            if (err) {
                reply(JSON.stringify({ error: new KoiflyError(ErrorTypes.RETRIEVING_FAILURE) }));
            }
        });
    }).catch((error) => {
        reply(JSON.stringify({ error: NormalizeError(error) }));
    });
};


module.exports = LogInHandler;
