'use strict';

var Sequelize = require('sequelize');
var sequelize = require('./sequelize');
var Flight = require('./flights');


var Site = sequelize.define('site', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
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
        validate: { min: 0 }
    },
    lat: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null,
        validate: { min: -90, max: 90 }
    },
    lng: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: null,
        validate: { min: -180, max: 180 }
    },
    remarks: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    see: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    pilotId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true, // updatedAt, createdAt
    scopes: {
        see: {
            where: {
                see: true
            }
        }
    },
    getterMethods: {
        coordinates: function()  {
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


Site.hasMany(Flight, {
    as: 'Flights',
    foreignKey: 'siteId',
    constraints: false
});


module.exports = Site;
