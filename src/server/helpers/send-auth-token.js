'use strict';

const ROOT_URL = require('../../config/variables').server.rootUrl;

const BcryptPromise = require('../../utils/bcrypt-promise');
const generateToken = require('./generate-token');
const sendMail = require('./send-mail');


/**
 * Generates random token,
 * saves its hash in DB for future comparison,
 * sends email with a link which contains pilot id and generated token
 * @param {object} pilot - sequelize pilot instance
 * @param {object} EmailMessageTemplate
 * @param {string} path - link that will be included in email
 * @returns {Promise} - whether email was sent successfully
 */
const sendAuthTokenToPilot = function(pilot, EmailMessageTemplate, path) {
    const authToken = generateToken();
    // Create hash out of token to store in DB since it's a password equivalent
    return BcryptPromise
        .hash(authToken)
        .then(hash => {
            const newPilotInfo = {
                token: hash,
                tokenExpirationTime: Date.now() + (1000 * 60 * 60 * 6) // 6 hours starting from now
            };

            // Update pilot info with token hash and token expiry date
            return pilot.update(newPilotInfo);
        })
        .then(newPilot => {
            // Send email which includes link with the randomly generated token
            const templateData = {
                url: `${ROOT_URL}${path}/${newPilot.id}/${authToken}`
            };
            return sendMail(newPilot.email, EmailMessageTemplate, templateData);
        });
};


module.exports = sendAuthTokenToPilot;
