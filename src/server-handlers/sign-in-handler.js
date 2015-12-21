'use strict';

var Bcrypt = require('bcrypt');
var sequelize = require('../orm/sequelize');
var NodeMailer = require('nodemailer');
var GenerateToken = require('./generate-token');
var NormalizeError = require('../utils/error-normalize');
var SanitizePilotInfo = require('./sanitize-pilot-info');
var Pilot = require('../orm/pilots');
var Constants = require('../utils/constants');


sequelize.sync();


var SignInHandler = function(request, reply) {

    var newPilot = JSON.parse(request.payload);
    Bcrypt.hash(newPilot.password, 10, (err, hash) => {
        if (hash) {
            var token = GenerateToken();
            newPilot.password = hash;
            newPilot.token = token;
            newPilot.tokenExpirationTime = Date.now() + (1000 * 60 * 60 * 24 * 7); // a week starting from now
            newPilot.activated = false;
            Pilot.create(newPilot).then((pilot) => {
                // Send email with verification token
                var transporter = NodeMailer.createTransport({
                    service:'Mailgun',
                    auth: {
                        user: Constants.mailGunLogin,
                        pass: Constants.mailGunPass
                    }
                });

                var link = 'http://localhost:3000/email/' + token;
                var message = {
                    from: 'info@koifly.com',
                    to: pilot.email,
                    subject: 'Your activation token',
                    text: 'Hello World! Follow the link to activate your account: ' + link,
                    html: '<p></p><b>Hello World</b></p><p>Follow the link to activate your account:  <a href="' + link + '">' + link + '</a></p>'
                };

                transporter.sendMail(message, (error, info) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('=> email was sent => ' + info.response);
                    }
                });

                // Set cookie
                var cookie = {
                    userId: pilot.getDataValue('id'),
                    hash: pilot.getDataValue('password')
                };
                request.auth.session.set(cookie);

                reply(JSON.stringify(SanitizePilotInfo(pilot)));
            }).catch((err) => {
                // DEV
                console.log('=> pilot creating error => ', err);
                reply(JSON.stringify({ error: NormalizeError(err) }));
            });
        }

        if (err) {
            reply(JSON.stringify({ error: NormalizeError(err) }));
        }
    });
};


module.exports = SignInHandler;
