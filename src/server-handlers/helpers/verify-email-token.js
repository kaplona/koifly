'use strict';

var sequelize = require('../../orm/sequelize');
var KoiflyError = require('../../utils/error');
var ErrorTypes = require('../../utils/error-types');
var Pilot = require('../../orm/pilots');


sequelize.sync();


/**
 * Looks for a pilot in DB with given token
 * if success clears token info and returns this pilot instance
 * @param {string} token
 * @returns {Promise.<pilot>} - sequelize instance of pilot record
 * @constructor
 */
var VerifyEmailToken = function(token) {
    // Find pilot by token
    var whereQuery = {
        token: token,
        tokenExpirationTime: {
            $gt: Date.now()
        }
    };
    return Pilot.findOne({ where: whereQuery }).then((pilot) => {
        // TODO (!pilot || pilot.id !== userId)
        if (pilot === null) {
            throw new KoiflyError(ErrorTypes.INVALID_TOKEN);
        }
        // Mark pilot as activated
        // Clear token info
        return pilot.update({
            token: null,
            tokenExpirationTime: null,
            isActivated: true
        });
    });
};


module.exports = VerifyEmailToken;
