'use strict';

const Sequelize = require('sequelize');

const SCOPES = require('../constants/orm-constants').SCOPES;
const ErrorMessages = require('../errors/error-messages');
const isValidId = require('./is-valid-id');
const sequelize = require('./sequelize');

const Site = require('./sites');
const Glider = require('./gliders');


const Flight = sequelize.define(

    'flight',

    // attributes
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },

        date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            validate: {
                isDate: { msg: ErrorMessages.DATE_FORMAT }
            }
        },

        siteId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        },

        altitude: {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 0,
            validate: {
                isFloat: { msg: ErrorMessages.POSITIVE_NUMBER.replace('%field', 'Altitude') },
                min: {
                    args: [ 0 ],
                    msg: ErrorMessages.POSITIVE_NUMBER.replace('%field', 'Altitude')
                }
            }
        },

        airtime: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                isInt: { msg: ErrorMessages.POSITIVE_ROUND.replace('%field', 'Airtime') },
                min: {
                    args: [ 0 ],
                    msg: ErrorMessages.POSITIVE_ROUND.replace('%field', 'Airtime')
                }
            }
        },

        gliderId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null
        },

        remarks: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: '',
            validate: {
                len: {
                    args: [0, 10000],
                    msg: ErrorMessages.MAX_LENGTH.replace('%field', 'Remarks').replace('%max', '10000')
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
            [SCOPES.visible]: {
                where: {
                    see: true
                }
            }
        },

        hooks: {
            // Checks that site and glider ids exist.
            beforeValidate: function(instance, options) {
                const gliderErrorMsg = ErrorMessages.NOT_EXIST.replace('%field', 'Glider');
                const siteErrorMsg = ErrorMessages.NOT_EXIST.replace('%field', 'Site');

                return Promise.all([
                    isValidId(Glider, instance.gliderId, instance.pilotId, gliderErrorMsg, options.transaction),
                    isValidId(Site, instance.siteId, instance.pilotId, siteErrorMsg, options.transaction)
                ]);
            }
        },

        indexes: [
            {
                name: 'flightPilotId',
                fields: [ 'pilotId' ]
            },
            {
                name: 'flightSiteId',
                fields: [ 'siteId' ]
            },
            {
                name: 'flightGliderId',
                fields: [ 'gliderId' ]
            },
            {
                name: 'flightUpdatedAt',
                fields: [ 'updatedAt' ]
            }
        ]
    }
);


Site.hasMany(Flight, {
    as: 'Flights',
    foreignKey: 'siteId',
    constraints: false
});

Glider.hasMany(Flight, {
    as: 'Flights',
    foreignKey: 'gliderId',
    constraints: false
});


module.exports = Flight;
