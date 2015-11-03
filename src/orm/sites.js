'use strict';

var Sequelize = require('sequelize');
var sequelize = require('./sequelize');
var isUnique = require('./is-unique');


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
        unique: true,
        validate: { isUnique: isUnique('sites', 'name') }
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
            isFloat: true,
            min: 0
        }
    },
    lat: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null,
        validate: {
            isFloat: true,
            min: -90,
            max: 90
        }
    },
    lng: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null,
        validate: {
            isFloat: true,
            min: -180,
            max: 180
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
        see: {
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
        bothCoordsOrNone: function() {
            if ((this.lat === null) !== (this.lng === null)) {
                throw new Error('Require either both latitude and longitude or neither')
            }
        }
    }
});


module.exports = Site;
