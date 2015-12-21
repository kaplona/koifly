'use strict';

var Sequelize = require('sequelize');
var sequelize = require('./sequelize');
var Flight = require('./flights');
var Site = require('./sites');
var Glider = require('./gliders');
var isUnique = require('./is-unique');


var Pilot = sequelize.define('pilot', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    userName: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        validate: { isUnique: isUnique('pilots', 'userName') }
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
            isUnique: isUnique('pilots', 'email')
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
            isInt: true,
            min: 0
        }
    },
    initialAirtime: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isInt: true,
            min: 0
        }
    },
    altitudeUnit: {
        type: Sequelize.ENUM('meter', 'feet'),
        allowNull: false,
        defaultValue: 'meter',
        validate: { isIn: [ ['meter', 'feet'] ] }
    },
    token: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
    },
    tokenExpirationTime: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    activated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    timestamps: true // automatically adds fields updatedAt and createdAt
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
