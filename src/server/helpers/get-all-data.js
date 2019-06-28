'use strict';

import errorTypes from '../../errors/error-types';
import getPilotValuesForFrontend from './get-pilot-values';
import KoiflyError from '../../errors/error';
import ormConstants from '../../constants/orm-constants';
import Sequelize from 'sequelize';

import Flight from '../../orm/models/flights';
import Site from '../../orm/models/sites';
import Glider from '../../orm/models/gliders';


/**
 * @param {Object[]} sequelizeRecordInstances - DB records set
 * @returns {Object[]} array of DB records with plain values
 * or in case of deleted instance just its id and deleted date
 * Note: this method was designed for use with sequelize record instances
 * which can be deleted (have property 'see')
 * don't use it for pilot records
 */
function getRecordsValues(sequelizeRecordInstances) {
  return sequelizeRecordInstances.map(record => {
    // If instance was deleted
    // user doesn't need its content
    if (!record.see) {
      return {
        id: record.id,
        see: false,
        updatedAt: record.updatedAt
      };
    }
    // {plain = true} will only return the values of sequelize record instance
    // (omits sequelize methods and additional stuff)
    return record.get({ plain: true });
  });
}


/**
 * @param {object} pilot - sequelize pilot instance
 * @param {string|null} dateFrom - If provided, only changes since that date are returned
 * @returns {Promise.<{pilot: Object, flights: Object, sites: Object, gliders: Object, lastModified: string}>}
 * lastModified - is the date of last modification in DB
 */
function getAllData(pilot, dateFrom) {

  const result = {};

  // If no dateFrom => it's first request from the user, so retrieve all data
  const scope = dateFrom ? ormConstants.SCOPES.all : ormConstants.SCOPES.visible;

  // We are sending all the data to the browser along with the latest date at which DB records were modified
  // So front-end can compare it with the latest date it has in its store
  // And update data if needed
  let maxLastModified = pilot.updatedAt;

  const whereQuery = { pilotId: pilot.id };
  if (dateFrom) {
    whereQuery.updatedAt = { [Sequelize.Op.gt]: dateFrom };
    maxLastModified = dateFrom > maxLastModified ? dateFrom : maxLastModified;
  }

  // Promise.all resolves only if every promises in the given list resolves
  return Promise
    .all([
      // parallel asynchronous requests
      Flight.scope(scope).findAll({ where: whereQuery }),
      Site.scope(scope).findAll({ where: whereQuery }),
      Glider.scope(scope).findAll({ where: whereQuery })
    ])
    .then(recordsSet => {
      // Values appear in the same order as we requested for them
      result.flights = getRecordsValues(recordsSet[0]);
      result.sites = getRecordsValues(recordsSet[1]);
      result.gliders = getRecordsValues(recordsSet[2]);

      // Find the latest updating date of all records
      Object.values(result).forEach(records => {
        records.forEach(record => {
          maxLastModified = (record.updatedAt > maxLastModified) ? record.updatedAt : maxLastModified;
        });
      });

      result.lastModified = maxLastModified;
      result.pilot = getPilotValuesForFrontend(pilot);

      return result;
    })
    .catch(() => {
      throw new KoiflyError(errorTypes.DB_READ_ERROR);
    });
}

export default getAllData;
