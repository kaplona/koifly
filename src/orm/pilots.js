'use strict';

var Sequelize = require('sequelize');

var ErrorMessages = require('../errors/error-messages');
var isUnique = require('./is-unique');
var sequelize = require('./sequelize');

var Flight = require('./flights');
var Site = require('./sites');
var Glider = require('./gliders');


var Pilot = sequelize.define(

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
            type: Sequelize.STRING(100),
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
            type: Sequelize.STRING(64),
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
            type: Sequelize.BIGINT(14),
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

        indexes: [
            {
                name: 'pilotEmail',
                fields: [ 'email' ],
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
