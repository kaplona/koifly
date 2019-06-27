'use strict';
/* eslint-disable new-cap */
import Sequelize from 'sequelize';
import db from '../sequelize-db';
import errorMessages from '../../errors/error-messages';
import isUnique from '../validation-helpers/is-unique';
import ormConstants from '../../constants/orm-constants';

import Pilot from './pilots';


const Site = db.define(
  'site',

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
          msg: errorMessages.MAX_LENGTH.replace('%field', 'Site Name').replace('%max', '100')
        }
      }
    },

    location: {
      type: Sequelize.STRING(1000), // eslint-disable-line new-cap
      allowNull: false,
      defaultValue: '',
      validate: {
        len: {
          args: [0, 1000],
          msg: errorMessages.MAX_LENGTH.replace('%field', 'Location').replace('%max', '1000')
        }
      }
    },

    launchAltitude: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isFloat: { msg: errorMessages.POSITIVE_NUMBER.replace('%field', 'Launch altitude') },
        min: {
          args: 0,
          msg: errorMessages.POSITIVE_NUMBER.replace('%field', 'Launch altitude')
        }
      }
    },

    lat: {
      type: Sequelize.DECIMAL(9, 6), // eslint-disable-line new-cap
      allowNull: true,
      defaultValue: null,
      validate: {
        isDecimal: { msg: errorMessages.COORDINATES },
        min: {
          args: -90,
          msg: errorMessages.COORDINATES
        },
        max: {
          args: 90,
          msg: errorMessages.COORDINATES
        }
      }
    },

    lng: {
      type: Sequelize.DECIMAL(9, 6), // eslint-disable-line new-cap
      allowNull: true,
      defaultValue: null,
      validate: {
        isDecimal: { msg: errorMessages.COORDINATES },
        min: {
          args: -180,
          msg: errorMessages.COORDINATES
        },
        max: {
          args: 180,
          msg: errorMessages.COORDINATES
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
          msg: errorMessages.MAX_LENGTH.replace('%field', 'Remarks').replace('%max', '10000')
        }
      }
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
      beforeValidate: function(instance, options) {
        const errorMsg = errorMessages.DOUBLE_VALUE.replace('%field', 'Site');
        return isUnique(Site, instance, 'name', errorMsg, options.transaction);
      }
    },

    getterMethods: {
      coordinates: function() {
        if (this.lat === null || this.lng === null) {
          return null;
        }
        return { lat: this.lat, lng: this.lng };
      }
    },

    setterMethods: {
      coordinates: function(coordinatesObj) {
        if (coordinatesObj === null) {
          coordinatesObj = { lat: null, lng: null };
        }
        this.setDataValue('lat', coordinatesObj.lat);
        this.setDataValue('lng', coordinatesObj.lng);
      }
    },

    validate: {
      coordinates: function() {
        if ((this.lat === null) !== (this.lng === null)) {
          throw new Error(errorMessages.EITHER_BOTH_COORDS_OR_NONE);
        }
      }
    },

    indexes: [
      {
        name: 'sitePilotId',
        fields: [ 'pilotId' ]
      },
      {
        name: 'siteUpdatedAt',
        fields: [ 'updatedAt' ]
      }
    ]
  }
);


Pilot.hasMany(Site, {
  as: 'Sites', // pilotInstance.getSites, pilotInstance.setSites
  foreignKey: 'pilotId',
  constraints: false
});


export default Site;
