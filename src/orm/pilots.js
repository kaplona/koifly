'use strict';

var Sequelize = require('sequelize');
var sequelize = require('./sequelize');
var Flight = require('./flights');
var Site = require('./sites');
var Glider = require('./gliders');


var Pilot = sequelize.define('pilot', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    userName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { isEmail: true }
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    initialFlightNum: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 }
    },
    initialAirtime: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 }
    },
    altitudeUnits: {
        type: Sequelize.ENUM('meter', 'feet'),
        allowNull: false,
        defaultValue: 'meter'
    }
}, {
    timestamps: true // updatedAt, createdAt
});


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
