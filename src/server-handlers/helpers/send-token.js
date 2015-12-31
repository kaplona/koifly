'use strict';

var BcryptPromise = require('../../utils/bcrypt-promise');
var GenerateToken = require('./generate-token');
var SendMail = require('./send-mail');
var Constants = require('../../utils/constants');


/**
 * Generates random token,
 * saves its hash in DB for future comparison,
 * sends email with a link which contains pilot id and generated token
 * @param {object} pilot - sequelize pilot instance
 * @param {object} emailMessage - one of EmailMessages
 * @param {string} path - link that will be included in email
 * @returns {Promise}
 */
var SendTokenToPilot = function(pilot, emailMessage, path) {
    var token = GenerateToken();
    // Create hash out of token to store in DB since it's a password equivalent
    BcryptPromise.hash(token).then((hash) => {
        var newPilotInfo = {
            token: hash,
            tokenExpirationTime: Date.now() + (1000 * 60 * 60 * 6) // 6 hours starting from now
        };

        // Update pilot info with token hash and token expiry date
        return pilot.update(newPilotInfo)
    }).then((pilot) => {
        // Send email which includes link with the randomly generated token
        var templateData = {
            url: Constants.domain + path + '/' + pilot.id + '/' + token
        };
        return SendMail(pilot.email, emailMessage, templateData);
    });
};


module.exports = SendTokenToPilot;
