'use strict';

var sequelize = require('../orm/sequelize');
var KoiflyError = require('../utils/error');
var ErrorTypes = require('../utils/error-types');
var NormalizeError = require('../utils/error-normalize');
var Pilot = require('../orm/pilots');


sequelize.sync();


var VerifyEmail = function(token) {
    // Find pilot by token
    var whereQuery = {
        token: token,
        tokenExpirationTime: {
            $gt: Date.now()
        }
    };
    return Pilot.findOne({ where: whereQuery }).then((pilot) => {
        if (pilot === null) {
            throw new KoiflyError(ErrorTypes.INVALID_TOKEN);
        }
        // Mark pilot as activated
        return pilot.update({
            token: null,
            tokenExpirationTime: null,
            activated: true
        });
    });
};


module.exports = VerifyEmail;
