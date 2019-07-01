import BaseModel from './base-model';
import dataService from '../services/data-service';
import errorTypes from '../errors/error-types';
import Util from '../utils/util';


let PilotModel = {
  keys: {
    single: 'pilot',
    plural: 'pilot'
  },

  formValidationConfig: {
    userName: {
      method: 'text',
      rules: {
        defaultVal: '',
        maxLength: 100,
        field: 'Pilot name'
      }
    },
    initialFlightNum: {
      method: 'number',
      rules: {
        min: 0,
        round: true,
        defaultVal: 0,
        field: 'Initial Number of Flights'
      }
    },
    hours: {
      method: 'number',
      rules: {
        min: 0,
        round: true,
        defaultVal: 0,
        field: 'Initial Airtime'
      }
    },
    minutes: {
      method: 'number',
      rules: {
        min: 0,
        round: true,
        defaultVal: 0,
        field: 'Initial Airtime'
      }
    }
  },

  isEmailVerificationNotice: false,

  /**
   * Prepare data to show to user
   * @returns {object|null} - pilot info
   * null - if no data in front end
   * error object - if data wasn't loaded due to error
   */
  getPilotOutput() {
    const pilot = this.getStoreContent();
    if (!pilot || pilot.error) {
      return pilot;
    }

    // require FlightModel here so as to avoid circle requirements
    const FlightModel = require('./flight');

    const flightNumTotal = pilot.initialFlightNum + FlightModel.getNumberOfFlights();
    const flightNumThisYear = FlightModel.getNumberOfFlightsThisYear();
    const airtimeTotal = pilot.initialAirtime + FlightModel.getTotalAirtime();
    const siteNum = FlightModel.getNumberOfVisitedSites();
    const gliderNum = FlightModel.getNumberOfUsedGliders();
    const daysSinceLastFlight = FlightModel.getDaysSinceLastFlight();

    return {
      email: pilot.email,
      userName: pilot.userName,
      flightNumTotal: flightNumTotal,
      flightNumThisYear: flightNumThisYear,
      airtimeTotal: airtimeTotal,
      siteNum: siteNum,
      gliderNum: gliderNum,
      altitudeUnit: pilot.altitudeUnit,
      daysSinceLastFlight: daysSinceLastFlight
    };
  },

  /**
   * Prepare data to show to user
   * @returns {object|null} - pilot info
   * null - if no data at front end
   * error object - if data wasn't loaded due to error
   */
  getEditOutput() {
    const pilot = this.getStoreContent();
    if (!pilot || pilot.error) {
      return pilot;
    }

    // If initialFlightNum or hours or minutes is 0 show empty string to user
    // So user won't need to erase 0 before entering other value
    const initialFlightNum = pilot.initialFlightNum || '';
    const hoursMinutes = Util.getHoursMinutes(pilot.initialAirtime);

    return {
      email: pilot.email,
      userName: pilot.userName,
      initialFlightNum: initialFlightNum.toString(),
      altitudeUnit: pilot.altitudeUnit,
      hours: hoursMinutes.hours ? hoursMinutes.hours.toString() : '',
      minutes: hoursMinutes.minutes ? hoursMinutes.minutes.toString() : ''
    };
  },

  /**
   * Fills empty fields with their defaults
   * takes only fields that should be send to the server
   * modifies some values how they should be stored in DB
   * @param {object} newPilotInfo
   * @returns {object} - pilot info ready to send to the server
   */
  getDataForServer(newPilotInfo) {
    newPilotInfo = this.setDefaultValues(newPilotInfo);

    // Return only fields which will be send to the server
    return {
      userName: newPilotInfo.userName,
      initialFlightNum: parseInt(newPilotInfo.initialFlightNum),
      initialAirtime: parseInt(newPilotInfo.hours) * 60 + parseInt(newPilotInfo.minutes),
      altitudeUnit: newPilotInfo.altitudeUnit
    };
  },

  /**
   * Sends passwords to the server
   * @param {string} currentPassword
   * @param {string} nextPassword
   * @returns {Promise} - whether saving was successful or not
   */
  changePassword(currentPassword, nextPassword) {
    return dataService.changePassword(currentPassword, nextPassword);
  },

  importFlights(dataUri) {
    return dataService.importFlights(dataUri);
  },

  /**
   * @returns {Promise} - whether logout was successful or not
   */
  logout: function() {
    return dataService.logout();
  },

  isLoggedIn() {
    const pilot = this.getStoreContent();
    return (
      pilot !== null &&
      (!pilot.error || pilot.error.type !== errorTypes.AUTHENTICATION_ERROR)
    );
  },

  /**
   * @returns {string|null} - email address or null if no pilot information in front end yet
   */
  getEmailAddress() {
    const pilot = this.getStoreContent();
    if (!pilot || pilot.error) {
      return null;
    }
    return pilot.email;
  },

  /**
   * @returns {boolean|object} - is pilot's email verified or loading error object
   * true - if no information about pilot yet,
   * so he won't get email verification notice until we know for sure that email is not verified
   */
  getUserActivationStatus() {
    const pilot = this.getStoreContent();
    if (!pilot) {
      return true;
    }
    if (pilot.error) {
      return pilot;
    }
    return pilot.isActivated;
  },

  /**
   * @returns {boolean} - if email verification notice should be shown,
   * true - if pilot didn't confirmed his email or no pilot info at front-end yet
   * false - if pilot confirmed his email or doesn't want to see notification about this
   */
  getEmailVerificationNoticeStatus() {
    return !this.getUserActivationStatus() && !this.isEmailVerificationNotice;
  },

  hideEmailVerificationNotice() {
    this.isEmailVerificationNotice = true;
  }
};


PilotModel = Object.assign({}, BaseModel, PilotModel);
export default PilotModel;
