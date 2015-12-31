'use strict';

var GenerateToken = require('./generate-token');
var SendMail = require('./send-mail');
var Constants = require('../../utils/constants');


/**
 * Generates random token,
 * saves it in DB for future comparison,
 * sends email with a link which contains generated token
 * @param {object} pilot - sequelize pilot instance
 * @param {object} emailMessage - one of EmailMessages
 * @param {string} path - link that will be included in email
 * @returns {Promise}
 */
var SendTokenToPilot = function(pilot, emailMessage, path) {
    var token = GenerateToken();
    var newPilotInfo = {
        token: token,
        tokenExpirationTime: Date.now() + (1000 * 60 * 60 * 6) // 6 hours starting from now
    };

    // Update pilot info with randomly generated token and token expiry date
    pilot.update(newPilotInfo).then((pilot) => {
        // Send email which includes link with the token
        var templateData = {
            url: Constants.domain + path + '/' + token
        };
        return SendMail(pilot.email, emailMessage, templateData);
    });
};


module.exports = SendTokenToPilot;
