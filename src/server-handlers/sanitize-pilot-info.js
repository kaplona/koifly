'use strict';


var SanitizePilotInfo = function(pilot) {
    return {
        id: pilot.getDataValue('id'),
        userName: pilot.getDataValue('userName'),
        initialFlightNum: pilot.getDataValue('initialFlightNum'),
        initialAirtime: pilot.getDataValue('initialAirtime'),
        altitudeUnit: pilot.getDataValue('altitudeUnit'),
        updatedAt: pilot.getDataValue('updatedAt'),
        activated: pilot.activated
    };
};


module.exports = SanitizePilotInfo;
