'use strict';

const DOMAIN = require('../../secrets').domain;

var BcryptPromise = require('../../utils/bcrypt-promise');
var generateToken = require('./generate-token');
var SendMail = require('./send-mail');


/**
 * Generates random token,
 * saves its hash in DB for future comparison,
 * sends email with a link which contains pilot id and generated token
 * @param {object} pilot - sequelize pilot instance
 * @param {object} EmailMessageTemplate
 * @param {string} path - link that will be included in email
 * @returns {Promise}
 */
var sendAuthTokenToPilot = function(pilot, EmailMessageTemplate, path) {
    var authToken = generateToken();
    // Create hash out of token to store in DB since it's a password equivalent
    return BcryptPromise
        .hash(authToken)
        .then((hash) => {
            var newPilotInfo = {
                token: hash,
                tokenExpirationTime: Date.now() + (1000 * 60 * 60 * 6) // 6 hours starting from now
            };

            // Update pilot info with token hash and token expiry date
            return pilot.update(newPilotInfo)
        })
        .then((pilot) => {
            // Send email which includes link with the randomly generated token
            var templateData = {
                url: DOMAIN + path + '/' + pilot.id + '/' + authToken
            };
            return SendMail(pilot.email, EmailMessageTemplate, templateData);
        });
};


module.exports = sendAuthTokenToPilot;
