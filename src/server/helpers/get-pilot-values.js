'use strict';


/**
 * @param {object} pilot - sequelize pilot record instance
 * @returns {object} - pilot information for frontend
 */
var getPilotValuesForFrontend = function(pilot) {
    return {
        id:                 pilot.get('id'),
        email:              pilot.get('email'),
        userName:           pilot.get('userName'),
        initialFlightNum:   pilot.get('initialFlightNum'),
        initialAirtime:     pilot.get('initialAirtime'),
        altitudeUnit:       pilot.get('altitudeUnit'),
        updatedAt:          pilot.get('updatedAt'),
        isActivated:        pilot.get('isActivated') // true / false
    };
};


module.exports = getPilotValuesForFrontend;
