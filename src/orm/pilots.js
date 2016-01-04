'use strict';

var Sequelize = require('sequelize');
var sequelize = require('./sequelize');
var Flight = require('./flights');
var Site = require('./sites');
var Glider = require('./gliders');
var isUnique = require('./is-unique');
var ErrorMessages = require('../utils/error-messages');


var Pilot = sequelize.define('pilot', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    userName: {
        type: Sequelize.STRING,
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        set: function(value) {
            this.setDataValue('email', value.toLowerCase());
        },
        validate: {
            notNull: { msg: ErrorMessages.NOT_EMPTY.replace('%field', 'Email') },
            isEmail: { msg: ErrorMessages.NOT_VALID_EMAIL },
            isUnique: isUnique('pilots', 'email', ErrorMessages.EXISTENT_EMAIL)
        }
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: ErrorMessages.NOT_EMPTY.replace('%field', 'Password') }
        }
    },
    initialFlightNum: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isInt: { msg: ErrorMessages.POSITIVE_ROUND.replace('%field', 'Initial Flight Number') },
            min: {
                args: [ 0 ],
                msg: ErrorMessages.POSITIVE_ROUND.replace('%field', 'Initial Flight Number')
            }
        }
    },
    initialAirtime: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isInt: { msg: ErrorMessages.POSITIVE_ROUND.replace('%field', 'Initial Airtime') },
            min: {
                args: [ 0 ],
                msg: ErrorMessages.POSITIVE_ROUND.replace('%field', 'Initial Airtime')
            }
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
    isActivated: {
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
