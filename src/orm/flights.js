'use strict';

var Sequelize = require('sequelize');
var sequelize = require('./sequelize');


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
        defaultValue: null
    },
    altitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 }
    },
    airtime: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 }
    },
    gliderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    remarks: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    //creationDateTime: Sequelize.STRING, // Unix timestamp
    //lastModified: Sequelize.STRING, // Unix timestamp
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


module.exports = Flight;
