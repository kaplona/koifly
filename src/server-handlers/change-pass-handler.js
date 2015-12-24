'use strict';

var sequelize = require('../orm/sequelize');
var Pilot = require('../orm/pilots');
var BcryptPromise = require('../utils/bcrypt-promise');
var SetCookie = require('./helpers/set-cookie');
var GenerateToken = require('./helpers/generate-token');
var SendMail = require('./helpers/send-mail');
var EmailMessages = require('./helpers/email-messages');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var NormalizeError = require('../utils/error-normalize');


sequelize.sync();


var ChangePassHandler = function(request, reply) {
    var pilot; // we need it to have reference to current pilot
    var token = GenerateToken(); // for email notification
    var payload = JSON.parse(request.payload);

    Pilot.findById(request.auth.credentials.userId).then((pilotRecord) => {
        pilot = pilotRecord;
        // Compare password provided by user with the one we have in DB
        return BcryptPromise.compare(payload.oldPassword, pilot.password);
    }).then((isEqual) => {
        if (!isEqual) {
            throw new KoiflyError(ErrorTypes.SAVING_FAILURE, 'You entered wrong password');
        }
        return BcryptPromise.hash(payload.newPassword);
    }).then((hash) => {
        // Change password hash in DB
        // and set token in order to send user email notification
        var newPilotInfo = {
            password: hash,
            token: token,
            tokenExpirationTime: Date.now() + (1000 * 60 * 60) // an hour starting from now
        };
        return pilot.update(newPilotInfo);
    }).then((pilot) => {
        // Set cookie with new credentials
        SetCookie(request, pilot.id, pilot.password);

        // Send email notification to user
        // so he has opportunity to reset password
        // if it wasn't he who change the pass at the first place
        var path = '/reset-pass/' + token;
        SendMail(pilot.email, EmailMessages.PASSWORD_CHANGE, path);

        reply(JSON.stringify('success'));
    }).catch((error) => {
        reply(JSON.stringify({error: NormalizeError(error)}));
    });
};


module.exports = ChangePassHandler;
