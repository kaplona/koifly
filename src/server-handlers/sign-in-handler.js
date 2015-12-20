'use strict';

var Bcrypt = require('bcrypt');
var sequelize = require('../orm/sequelize');
var NormalizeError = require('../utils/error-normalize');
var SanitizePilotInfo = require('./sanitize-pilot-info');
var Pilot = require('../orm/pilots');


sequelize.sync();


var SignInHandler = function(request, reply) {
    var newPilot = JSON.parse(request.payload);

    Bcrypt.hash(newPilot.password, 10, (err, hash) => {

        if (hash) {
            newPilot.password = hash;
            Pilot.create(newPilot).then((pilot) => {
                // TODO send email verification
                // Set cookie
                var cookie = {
                    userId: pilot.getDataValue('id'),
                    hash: pilot.getDataValue('password')
                };
                request.auth.session.set(cookie);

                reply(JSON.stringify(SanitizePilotInfo(pilot)));
            }).catch((err) => {
                reply(JSON.stringify({ error: NormalizeError(err) }));
            });
        }

        if (err) {
            reply(JSON.stringify({ error: NormalizeError(err) }));
        }
    });
};


module.exports = SignInHandler;
