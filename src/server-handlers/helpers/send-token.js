'use strict';

var sequelize = require('../../orm/sequelize');
var GenerateToken = require('./generate-token');
var SendMail = require('./send-mail');
var KoiflyError = require('../../utils/error');
var ErrorTypes = require('../../utils/error-types');
var NormalizeError = require('../../utils/error-normalize');
var Pilot = require('../../orm/pilots');


sequelize.sync();


// pilotInfo is an object with id or email property
// which can uniquely identify user
var SendToken = function(reply, pilotInfo, emailMessage, path) {
    var token = GenerateToken();

    Pilot.findOne({ where: pilotInfo }).then((pilot) => {
        // TODO (!pilot || pilot.id !== userId)
        if (pilot === null) {
            throw new KoiflyError(ErrorTypes.NO_EXISTENT_RECORD, 'there is no pilot with provided email');
        }

        var newPilotInfo = {
            token: token,
            tokenExpirationTime: Date.now() + (1000 * 60 * 60) // an hour starting from now
        };
        return pilot.update(newPilotInfo);
    }).then((pilot) => {
        path = path + '/' + token;
        return SendMail(pilot.email, emailMessage, path);
    }).then(() => {
        reply(JSON.stringify('success'));
    }).catch((error) => {
        reply(JSON.stringify({ error: NormalizeError(error)}));
    });
};


module.exports = SendToken;
