'use strict';

var Sequelize = require('sequelize');

var ErrorMessages = require('../errors/error-messages');
var isUnique = require('./is-unique');
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
        allowNull: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        set: function(value) {
            this.setDataValue('email', value.toLowerCase());
        },
        validate: {
            isEmail: { msg: ErrorMessages.NOT_VALID_EMAIL },
            isUnique: isUnique('pilots', 'email', ErrorMessages.EXISTENT_EMAIL)
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
        type: Sequelize.ENUM('meters', 'feet'),
        allowNull: false,
        defaultValue: 'meters',
        validate: { isIn: [ ['meters', 'feet'] ] }
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
