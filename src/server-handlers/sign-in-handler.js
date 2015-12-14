'use strict';

var Bcrypt = require('bcrypt');
var _ = require('lodash');
var sequelize = require('../orm/sequelize');
var NormalizeError = require('../utils/error-normalize');
var Pilot = require('../orm/pilots');


sequelize.sync();


var SignInHandler = function(request, reply) {
    var newPilot = JSON.parse(request.payload);

    // TODO hash password
    Bcrypt.hash(newPilot.password, 10, (err, hash) => {
        // DEV
        console.log('bcrypt error => ', err);
        console.log('bcrypt hash=> ', hash);

        if (hash) {
            newPilot.password = hash;
            Pilot.create(newPilot).then((pilot) => {
                reply();
            }).catch((err) => {
                //DEV
                console.log('error => ', err);

                reply(JSON.stringify({ error: NormalizeError(err) }));
            });
        }

        if (err) {
            reply(JSON.stringify({ error: NormalizeError(err) }));
        }
    });
};


module.exports = SignInHandler;
