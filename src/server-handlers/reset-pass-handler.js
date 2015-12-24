'use strict';

var VerifyEmailToken = require('./verify-email');
var Bcrypt = require('bcrypt');
var GetAllData = require('./get-all-data');
var NormalizeError = require('../utils/error-normalize');


var ResetPassHandler = function(request, reply) {
    var payload = JSON.parse(request.payload);
    VerifyEmailToken(payload.token).then((pilot) => {
        Bcrypt.hash(payload.password, 10, (error, hash) => {
            if (hash) {
                // DEV
                console.log('=> new pass =>', payload.password);
                console.log('=> new hash =>', hash);

                pilot.update({password: hash}).then((pilot) => {
                    // Set cookie
                    var cookie = {
                        userId: pilot.getDataValue('id'),
                        hash: pilot.getDataValue('password')
                    };
                    request.auth.session.set(cookie);

                    // Get all pilot's data
                    return GetAllData(pilot, null);
                }).then((dbData) => {
                    reply(JSON.stringify(dbData));
                }).catch((error) => {
                    // DEV
                    console.log('=> error =>', error);

                    reply(JSON.stringify({error: NormalizeError(error)}));
                });
            }

            if (error) {
                reply(JSON.stringify({error: NormalizeError(error)}));
            }
        });
    }).catch((error) => {
        // DEV
        console.log('=> error =>', error);

        reply(JSON.stringify({error: NormalizeError(error)}));
    });
};


module.exports = ResetPassHandler;
