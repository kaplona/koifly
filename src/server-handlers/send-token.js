'use strict';

var sequelize = require('../orm/sequelize');
var NodeMailer = require('nodemailer');
var GenerateToken = require('./generate-token');
var NormalizeError = require('../utils/error-normalize');
var Pilot = require('../orm/pilots');
var Constants = require('../utils/constants');


sequelize.sync();


// options is an object with id or email property
var SendToken = function(options, reply) {
    var token = GenerateToken();

    Pilot.findOne({ where: options }).then((pilot) => {
        var newPilotInfo = {
            token: token,
            tokenExpirationTime: Date.now() + (1000 * 60 * 60) // an hour starting from now
        };

        return pilot.update(newPilotInfo);
    }).then((pilot) => {
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

        transporter.sendMail(message, (error) => {
            if (error) {
                reply(JSON.stringify({ error: NormalizeError(error)}));
            } else {
                reply(JSON.stringify('success'));
            }
        });
    });
};


module.exports = SendToken;
