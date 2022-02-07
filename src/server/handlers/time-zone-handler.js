import axios from 'axios';
import secrets from '../../secrets';
import KoiflyError from '../../errors/error';
import errorTypes from '../../errors/error-types';

/**
 * Gets timezone details from coordinates and timestamp. Currently, uses Google Maps API.
 * @param {Object} request
 * @return {Promise.<{status: string, timeZoneId: string}>}
 */
function timeZoneHandler(request) {
  const url = 'https://maps.googleapis.com/maps/api/timezone/json';
  const queryParams = {
    location: request.query.latLngString,
    timestamp: request.query.timestampInSec,
    key: secrets.googleServerSideApiKey,
  };

  return axios
    .get(url, { params: queryParams })
    .then(res => res.data)
    .catch(err => {
      return Promise.reject(new KoiflyError(errorTypes.THIRD_PARTY_ERROR, null, [err]));
    });
}

export default timeZoneHandler;
