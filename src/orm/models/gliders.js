'use strict';
/* eslint-disable new-cap */
const Sequelize = require('sequelize');

const SCOPES = require('../../constants/orm-constants').SCOPES;
const ErrorMessages = require('../../errors/error-messages');
const isUnique = require('../validation-helpers/is-unique');
const sequelize = require('../sequelize');


const Glider = sequelize.define(
  'glider',

  // attributes
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      unique: true,
      primaryKey: true
    },

    name: {
      type: Sequelize.STRING(100), // eslint-disable-line new-cap
      allowNull: false,
      validate: {
        len: {
          args: [0, 100],
          msg: ErrorMessages.MAX_LENGTH.replace('%field', 'Glider Name').replace('%max', '100')
        }
      }
    },

    initialFlightNum: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {msg: ErrorMessages.POSITIVE_ROUND.replace('%field', 'Initial Flight Number')},
        min: {
          args: [0],
          msg: ErrorMessages.POSITIVE_ROUND.replace('%field', 'Initial Flight Number')
        }
      }
    },

    initialAirtime: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {msg: ErrorMessages.POSITIVE_ROUND.replace('%field', 'Initial Airtime')},
        min: {
          args: [0],
          msg: ErrorMessages.POSITIVE_ROUND.replace('%field', 'Initial Airtime')
        }
      }
    },

    remarks: {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: '',
      validate: {
        len: {
          args: [0, 10000],
          msg: ErrorMessages.MAX_LENGTH.replace('%field', 'Remarks').replace('%max', '10000')
        }
      }
    },

    see: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      validate: {isIn: [[0, 1, true, false]]}
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
      [SCOPES.visible]: {
        where: {
          see: true
        }
      }
    },

    hooks: {
      beforeValidate: function (instance, options) {
        const errorMsg = ErrorMessages.DOUBLE_VALUE.replace('%field', 'Glider');
        return isUnique(Glider, instance, 'name', errorMsg, options.transaction);
      }
    },

    indexes: [
      {
        name: 'gliderPilotId',
        fields: ['pilotId']
      },
      {
        name: 'gliderUpdatedAt',
        fields: ['updatedAt']
      }
    ]
  }
);


module.exports = Glider;
