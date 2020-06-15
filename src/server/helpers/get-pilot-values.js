/**
 * @param {object} pilot - sequelize pilot record instance
 * @returns {object} - pilot information for frontend
 */
export default function getPilotValuesForFrontend(pilot) {
  return {
    id: pilot.get('id'),
    email: pilot.get('email'),
    userName: pilot.get('userName'),
    initialFlightNum: pilot.get('initialFlightNum'),
    initialAirtime: pilot.get('initialAirtime'),
    altitudeUnit: pilot.get('altitudeUnit'),
    distanceUnit: pilot.get('distanceUnit'),
    updatedAt: pilot.get('updatedAt'),
    isActivated: pilot.get('isActivated') // true / false
  };
}
