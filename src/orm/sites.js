'use strict';

var Sequelize = require('sequelize');

const SCOPES = require('../constants/orm-constants').SCOPES;
var ErrorMessages = require('../errors/error-messages');
var isUnique = require('./is-unique');
var sequelize = require('./sequelize');


var Site = sequelize.define('site', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isUnique: isUnique('sites', 'name', ErrorMessages.DOUBLE_VALUE.replace('%field', 'Site'))
        }
    },
    location: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
    },
    launchAltitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isFloat: { msg: ErrorMessages.POSITIVE_NUMBER.replace('%field', 'Launch altitude') },
            min: {
                args: [ 0 ],
                msg: ErrorMessages.POSITIVE_NUMBER.replace('%field', 'Launch altitude')
            }
        }
    },
    lat: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null,
        validate: {
            isFloat: { msg: ErrorMessages.COORDINATES },
            min: {
                args: [ -90 ],
                msg: ErrorMessages.COORDINATES
            },
            max: {
                args: [ 90 ],
                msg: ErrorMessages.COORDINATES
            }
        }
    },
    lng: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null,
        validate: {
            isFloat: { msg: ErrorMessages.COORDINATES },
            min: {
                args: [ -180 ],
                msg: ErrorMessages.COORDINATES
            },
            max: {
                args: [ 180 ],
                msg: ErrorMessages.COORDINATES
            }
        }
    },
    remarks: {
        type: Sequelize.TEXT,
        allowNull: false
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
}, {
    timestamps: true, // automatically adds fields updatedAt and createdAt
    scopes: {
        [SCOPES.visible]: {
            where: {
                see: true
            }
        }
    },
    getterMethods: {
        coordinates: function()  {
            if (this.lat === null && this.lng === null) {
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
                throw new Error(ErrorMessages.EITHER_BOTH_COORDS_OR_NON)
            }
        }
    }
});


module.exports = Site;
