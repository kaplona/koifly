'use strict';

var Sequelize = require('sequelize');
var sequelize = require('./sequelize');
var Flight = require('./flights');


var Glider = sequelize.define('glider', {
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
    }
});


Glider.hasMany(Flight, {
    as: 'Flights',
    foreignKey: 'gliderId',
    constraints: false
});


module.exports = Glider;
