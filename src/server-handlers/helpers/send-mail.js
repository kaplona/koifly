'use strict';

var _ = require('lodash');
var Promise = require('es6-promise').Promise;
var NodeMailer = require('nodemailer');
var Constants = require('../../utils/constants');


var SendEmail = function(email, message, path) {
    return new Promise((resolve, reject) => {
        var transporter = NodeMailer.createTransport({
            service:'Mailgun',
            auth: {
                user: Constants.mailGunLogin,
                pass: Constants.mailGunPass
            }
        });

        message = _.extend({}, message, { to: email });

        if (path) {
            path = Constants.domain + path;
            message.text = message.text.replace('%s', path);
            message.html = message.html.replace('%s', path).replace('%s', path);
        }

        transporter.sendMail(message, (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};


module.exports = SendEmail;
