'use strict';
/* eslint-disable new-cap */
const Sequelize = require('sequelize');

const ErrorMessages = require('../../errors/error-messages');
const isUnique = require('../validation-helpers/is-unique');
const sequelize = require('../sequelize');

const Flight = require('./flights');
const Site = require('./sites');
const Glider = require('./gliders');


const Pilot = sequelize.define(
  'pilot',

  // attributes
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      unique: true,
      primaryKey: true
    },

    userName: {
      type: Sequelize.STRING(100), // eslint-disable-line new-cap
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: ErrorMessages.MAX_LENGTH.replace('%field', 'User Name').replace('%max', '100')
        }
      }
    },

    email: {
      type: Sequelize.STRING,
      allowNull: false,
      set: function (value) {
        this.setDataValue('email', value.toLowerCase());
      },
      validate: {
        isEmail: {msg: ErrorMessages.NOT_VALID_EMAIL}
      }
    },

    password: {
      type: Sequelize.STRING,
      allowNull: false
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

    altitudeUnit: {
      type: Sequelize.ENUM('meters', 'feet'), // eslint-disable-line new-cap
      allowNull: false,
      defaultValue: 'meters',
      validate: {isIn: [['meters', 'feet']]}
    },

    token: {
      type: Sequelize.STRING(64), // eslint-disable-line new-cap
      allowNull: true,
      defaultValue: null,
      validate: {
        len: {
          args: [0, 64],
          msg: ErrorMessages.MAX_LENGTH.replace('%field', 'token!!!').replace('%max', '64')
        }
      }
    },

    tokenExpirationTime: {
      type: Sequelize.BIGINT(14), // eslint-disable-line new-cap
      allowNull: true,
      defaultValue: null
    },

    isSubscribed: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    isActivated: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },

  // options
  {
    timestamps: true, // automatically adds fields updatedAt and createdAt

    hooks: {
      beforeValidate: function (instance, options) {
        const errorMsg = ErrorMessages.EXISTENT_EMAIL;
        return isUnique(Pilot, instance, 'email', errorMsg, options.transaction, true);
      }
    },

    indexes: [
      {
        name: 'pilotEmail',
        fields: ['email'],
        type: 'UNIQUE'
      }
    ]
  }
);


Pilot.hasMany(Flight, {
  as: 'Flights',
  foreignKey: 'pilotId',
  constraints: false
});

Pilot.hasMany(Site, {
  as: 'Sites',
  foreignKey: 'pilotId',
  constraints: false
});

Pilot.hasMany(Glider, {
  as: 'Gliders',
  foreignKey: 'pilotId',
  constraints: false
});


module.exports = Pilot;
