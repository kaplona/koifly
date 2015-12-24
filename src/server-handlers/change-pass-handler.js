'use strict';

var sequelize = require('../orm/sequelize');
var Pilot = require('../orm/pilots');
var Bcrypt = require('bcrypt');
var SetCookie = require('./set-cookie');
var GenerateToken = require('./generate-token');
var SendMail = require('./send-mail');
var EmailMessages = require('./email-messages');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var NormalizeError = require('../utils/error-normalize');


sequelize.sync();


var ChangePassHandler = function(request, reply) {
    var payload = JSON.parse(request.payload);
    Pilot.findById(request.auth.credentials.userId).then((pilot) => {

        Bcrypt.compare(payload.oldPassword, pilot.password, (err, res) => {
            if (err) {
                reply(JSON.stringify({ error: new KoiflyError(ErrorTypes.RETRIEVING_FAILURE) }));
            }

            if (res === false) {
                reply(JSON.stringify({ error: new KoiflyError(ErrorTypes.SAVING_FAILURE, 'You entered wrong password') }));
            }

            if (res) {
                Bcrypt.hash(payload.newPassword, 10, (error, hash) => {
                    if (error) {
                        reply(JSON.stringify({error: NormalizeError(error)}));
                    }

                    if (hash) {
                        var token = GenerateToken();
                        var newPilotInfo = {
                            password: hash,
                            token: token,
                            tokenExpirationTime: Date.now() + (1000 * 60 * 60) // an hour starting from now
                        };
                        pilot.update(newPilotInfo).then((pilot) => {
                            SetCookie(request, pilot.id, hash);
                            var path = '/reset-pass/' + token;
                            SendMail(pilot.email, EmailMessages.PASSWORD_CHANGE, path);
                        }).then(() => {
                            reply(JSON.stringify('success'));
                        }).catch((error) => {
                            // DEV
                            console.log('=> error =>', error);

                            reply(JSON.stringify({error: NormalizeError(error)}));
                        });
                    }
                });
            }
        });
    }).catch((error) => {
        // DEV
        console.log('=> error =>', error);

        reply(JSON.stringify({error: NormalizeError(error)}));
    });
};


module.exports = ChangePassHandler;
