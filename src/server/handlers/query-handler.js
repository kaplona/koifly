/* eslint-disable no-use-before-define */
/* since I define helpers functions which are not invoked in this file  */
import db from '../../orm/sequelize-db';
import errorTypes from '../../errors/error-types';
import getAllData from '../helpers/get-all-data';
import KoiflyError from '../../errors/error';
import normalizeError from '../../errors/normalize-error';
import Flight from '../../orm/models/flights';
import Glider from '../../orm/models/gliders';
import Pilot from '../../orm/models/pilots';
import Site from '../../orm/models/sites';

/**
 * Saves data in case of POST request
 * Replies with all user's data or error if the latest occurred
 * @param {Object} request
 */
function queryHandler(request) {
  return Pilot
    .findByPk(request.auth.credentials.userId)
    .then(pilot => {
      if (request.method === 'get') {
        // Get all data from the DB since lastModified
        return getAllData(pilot, JSON.parse(request.query.lastModified));
      }

      if (request.method === 'post') {
        const requestPayload = request.payload;

        // Check that user are trying to change his/her own data
        if (requestPayload.pilotId !== pilot.id) {
          throw new KoiflyError(errorTypes.USER_MISMATCH);
        }

        // If data type is not specified throw error
        if (!['flight', 'site', 'glider', 'pilot'].includes(requestPayload.dataType)) {
          throw new KoiflyError(errorTypes.BAD_REQUEST);
        }

        // If data is not an Object throw error
        if (!(requestPayload.data instanceof Object)) {
          throw new KoiflyError(errorTypes.BAD_REQUEST);
        }

        return saveData(requestPayload.dataType, requestPayload.data, pilot)
          .catch(error => {
            // If it's any other error but KoiflyError will replace it with KoiflyError with given type
            throw normalizeError(error, errorTypes.DB_WRITE_ERROR);
          })
          .then(() => {
            // Get all data from the DB since lastModified
            return getAllData(pilot, requestPayload.lastModified);
          });
      }
    })
    .catch(error => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Error => ', error); // eslint-disable-line no-console
      }

      return { error: normalizeError(error) };
    });
}


/**
 * @param {string} dataType
 * @param {object} data
 * @param {object} pilot - sequelize instance
 * @returns {Promise} - whether the saving was successful
 */
function saveData(dataType, data, pilot) {
  const pilotId = pilot.id;
  switch (dataType) {
    case 'flight':
      return saveFlight(data, pilotId);
    case 'site':
      return saveSite(data, pilotId);
    case 'glider':
      return saveGlider(data, pilotId);
    case 'pilot':
      return savePilotInfo(data, pilot);
  }
}


/**
 * @param {object} data
 * @param {number} pilotId
 * @returns {Promise.<flight>} - sequelize flight instance
 */
function saveFlight(data, pilotId) {
  // if new data have property see and it's false
  if (data.see === false) {
    data = {
      id: data.id,
      see: false
    };
    // Make sure that we updating the information that user is allowed to update
  } else {
    data = {
      id: data.id,
      date: data.date,
      siteId: data.siteId,
      altitude: data.altitude,
      airtime: data.airtime,
      gliderId: data.gliderId,
      remarks: data.remarks,
      igc: data.igc
    };
  }

  if (!data.id) {
    data.pilotId = pilotId;
    return Flight.create(data);
  }

  return Flight
    .findOne({ where: { id: data.id, pilotId: pilotId } })
    .then(flight => {
      if (!flight || flight.id.toString() !== data.id.toString()) {
        throw new KoiflyError(errorTypes.RECORD_NOT_FOUND);
      }

      return flight.update(data);
    });
}


/**
 * @param {object} data
 * @param {number} pilotId
 * @returns {Promise} - sequelize site instance
 */
function saveSite(data, pilotId) {
  // if new data have property see and it's falsy
  if (data.see === false) {
    data = {
      id: data.id,
      see: false
    };
    // Make sure that we updating the information that user is allowed to update
  } else {
    data = {
      id: data.id,
      name: data.name,
      location: data.location,
      launchAltitude: data.launchAltitude,
      coordinates: data.coordinates,
      remarks: data.remarks
    };
  }

  if (!data.id) {
    data.pilotId = pilotId;
    return Site.create(data);
  }

  // Start transaction
  // in order to delete site with all its references in flight records
  return db.transaction(t => {
    return Site
      .findOne({ where: { id: data.id, pilotId: pilotId }, transaction: t })
      .then(site => {
        if (!site || site.id.toString() !== data.id.toString()) {
          throw new KoiflyError(errorTypes.RECORD_NOT_FOUND);
        }

        return site.update(data, { transaction: t });
      })
      .then(site => {
        if (!site.see) {
          return Flight.update(
            { siteId: null },
            { where: { siteId: site.id }, transaction: t }
          );
        }
      });
  });
}


/**
 * @param {object} data
 * @param {number} pilotId
 * @returns {Promise.<glider>} - sequelize glider instance
 */
function saveGlider(data, pilotId) {
  // if new data have property see and it's false
  if (data.see === false) {
    data = {
      id: data.id,
      see: false
    };
    // Make sure that we updating the information that user is allowed to update
  } else {
    data = {
      id: data.id,
      name: data.name,
      initialFlightNum: data.initialFlightNum,
      initialAirtime: data.initialAirtime,
      remarks: data.remarks
    };
  }

  if (!data.id) {
    data.pilotId = pilotId;
    return Glider.create(data);
  }

  // Start transaction
  // in order to delete glider with all its references in flight records
  return db.transaction(t => {
    return Glider
      .findOne({ where: { id: data.id, pilotId: pilotId }, transaction: t })
      .then(glider => {
        if (!glider || glider.id.toString() !== data.id.toString()) {
          throw new KoiflyError(errorTypes.RECORD_NOT_FOUND);
        }

        return glider.update(data, { transaction: t });
      })
      .then(glider => {
        if (!glider.see) {
          return Flight.update(
            { gliderId: null },
            { where: { gliderId: glider.id }, transaction: t }
          );
        }
      });
  });
}


/**
 * @param {object} data - field names and new values to be updated
 * @param {object} pilot - sequelize DB instance to update
 * @returns {Promise.<pilot>} - pilot is sequelize DB instance
 */
function savePilotInfo(data, pilot) {
  // Make sure that we updating the information that user is allowed to update
  data = {
    userName: data.userName,
    initialFlightNum: data.initialFlightNum,
    initialAirtime: data.initialAirtime,
    altitudeUnit: data.altitudeUnit
  };

  return pilot.update(data);
}


export default queryHandler;
