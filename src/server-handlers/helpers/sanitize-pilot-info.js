'use strict';


/**
 * @param {object} pilot - sequelize instance of pilot record
 * @returns {object} - pilot information which front end needs
 */
var SanitizePilotInfo = function(pilot) {
    return {
        id: pilot.getDataValue('id'),
        email: pilot.getDataValue('email'),
        userName: pilot.getDataValue('userName'),
        initialFlightNum: pilot.getDataValue('initialFlightNum'),
        initialAirtime: pilot.getDataValue('initialAirtime'),
        altitudeUnit: pilot.getDataValue('altitudeUnit'),
        updatedAt: pilot.getDataValue('updatedAt'),
        isActivated: pilot.isActivated // true / false
    };
};


module.exports = SanitizePilotInfo;
