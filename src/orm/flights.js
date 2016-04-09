'use strict';

var Sequelize = require('sequelize');

const SCOPES = require('../constants/orm-constants').SCOPES;
var ErrorMessages = require('../errors/error-messages');
var isValidId = require('./is-valid-id');
var sequelize = require('./sequelize');

var Site = require('./sites');
var Glider = require('./gliders');


var Flight = sequelize.define('flight', {
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
        defaultValue: null,
        validate: {
            isValidId: isValidId('sites', ErrorMessages.NOT_EXIST.replace('%field', 'Site'))
        }
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
        defaultValue: null,
        validate: {
            isValidId: isValidId('gliders', ErrorMessages.NOT_EXIST.replace('%field', 'Glider'))
        }
    },
    remarks: {
        type: Sequelize.TEXT,
        allowNull: false,
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
}, {
    timestamps: true, // automatically adds fields updatedAt and createdAt
    scopes: {
        [SCOPES.visible]: {
            where: {
                see: true
            }
        }
    }
});


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
