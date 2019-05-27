'use strict';
/* eslint-disable new-cap */
const Sequelize = require('sequelize');
const db = require('../sequelize-db');
const errorMessages = require('../../errors/error-messages');
const isDate = require('../validation-helpers/is-date');
const isValidId = require('../validation-helpers/is-valid-id');
const ormConstants = require('../../constants/orm-constants');

const Site = require('./sites');
const Glider = require('./gliders');


const Flight = db.define(
  'flight',

  // attributes
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      unique: true,
      primaryKey: true
    },

    date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      validate: {
        isDate: isDate
      }
    },

    siteId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    },

    altitude: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isFloat: { msg: errorMessages.POSITIVE_NUMBER.replace('%field', 'Altitude') },
        min: {
          args: [ 0 ],
          msg: errorMessages.POSITIVE_NUMBER.replace('%field', 'Altitude')
        }
      }
    },

    airtime: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: errorMessages.POSITIVE_ROUND.replace('%field', 'Airtime') },
        min: {
          args: [ 0 ],
          msg: errorMessages.POSITIVE_ROUND.replace('%field', 'Airtime')
        }
      }
    },

    gliderId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    },

    remarks: {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: '',
      validate: {
        len: {
          args: [0, 10000],
          msg: errorMessages.MAX_LENGTH.replace('%field', 'Remarks').replace('%max', '10000')
        }
      }
    },

    igc: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      defaultValue: null
    },

    see: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: { isIn: [ [0, 1, true, false] ] }
    },

    pilotId: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  },

  // options
  {
    timestamps: true, // automatically adds fields updatedAt and createdAt

    scopes: {
      [ormConstants.SCOPES.visible]: {
        where: {
          see: true
        }
      }
    },

    hooks: {
      // Checks that site and glider ids exist.
      beforeValidate: function(instance, options) {
        const gliderErrorMsg = errorMessages.NOT_EXIST.replace('%field', 'Glider');
        const siteErrorMsg = errorMessages.NOT_EXIST.replace('%field', 'Site');

        return Promise.all([
          isValidId(Glider, instance.gliderId, instance.pilotId, gliderErrorMsg, options.transaction),
          isValidId(Site, instance.siteId, instance.pilotId, siteErrorMsg, options.transaction)
        ]);
      }
    },

    indexes: [
      {
        name: 'flightPilotId',
        fields: [ 'pilotId' ]
      },
      {
        name: 'flightSiteId',
        fields: [ 'siteId' ]
      },
      {
        name: 'flightGliderId',
        fields: [ 'gliderId' ]
      },
      {
        name: 'flightUpdatedAt',
        fields: [ 'updatedAt' ]
      }
    ]
  }
);


Site.hasMany(Flight, {
  as: 'Flights',
  foreignKey: 'siteId',
  constraints: false
});

Glider.hasMany(Flight, {
  as: 'Flights',
  foreignKey: 'gliderId',
  constraints: false
});


module.exports = Flight;
