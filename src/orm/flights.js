'use strict';

var Sequelize = require('sequelize');
var sequelize = require('./sequelize');
var Site = require('./sites');
var Glider = require('./gliders');
var isValidId = require('./is-valid-id');


var Flight = sequelize.define('flight', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: { isDate: true }
    },
    siteId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: { isValidId: isValidId('sites', 'there is no site with this id') }
    },
    altitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isFloat: true,
            min: 0
        }
    },
    airtime: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isInt: true,
            min: 0
        }
    },
    gliderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        validate: { isValidId: isValidId('gliders', 'there is no glider with this id') }
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
