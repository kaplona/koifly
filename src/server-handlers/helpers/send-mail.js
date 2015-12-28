'use strict';

var _ = require('lodash');
var Promise = require('es6-promise').Promise;
var NodeMailer = require('nodemailer');
var Constants = require('../../utils/constants');


/**
 *
 * @param {string} emailAddress
 * @param {object} message - email message options: from, subject, text, html
 * @param {string} path - if provided this path will be added to email text as a link (usually it's link with a token)
 * @returns {Promise} - is email was send or error occurred
 */
var SendEmail = function(emailAddress, message, path) {
    return new Promise((resolve, reject) => {
        // createTransport uses smtpTransport as default
        var transporter = NodeMailer.createTransport({
            service:'Mailgun',
            auth: {
                user: Constants.mailgunLogin,
                pass: Constants.mailgunPass
            }
        });

        message = _.extend({}, message, { to: emailAddress });

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
