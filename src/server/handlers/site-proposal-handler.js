import axios from 'axios';
import KoiflyError from '../../errors/error';
import errorTypes from '../../errors/error-types';

/**
 * Gets nearest site details from coordinates. Currently, uses  paragliding.earth API.
 * @param {Object} request
 * @param {Object} reply
 * @return {Promise.<{status: string, siteName: string}>}
 */
function siteProposalHandler(request, reply) {
  const url = 'http://www.paragliding.earth/api/geojson/getAroundLatLngSites.php';
  const queryParams = {
    lat: request.query.lat,
    lng: request.query.lng,
    distance: request.query.dist,
  };

  return axios
    .get(url, { params: queryParams })
    .then(res => res.data)
    .catch(() => {
      return reply.response({
        error: new KoiflyError(errorTypes.THIRD_PARTY_ERROR)
      });
    });
}

export default siteProposalHandler;
