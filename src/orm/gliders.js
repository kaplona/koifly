'use strict';

var Sequelize = require('sequelize');

const SCOPES = require('./orm-constants').SCOPES;
var ErrorMessages = require('../errors/error-messages');
var isUnique = require('./is-unique');
var sequelize = require('./sequelize');


var Glider = sequelize.define('glider', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isUnique: isUnique('gliders', 'name', ErrorMessages.DOUBLE_VALUE.replace('%field', 'Glider'))
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
        [SCOPES.visible]: {
            where: {
                see: true
            }
        }
    }
});


module.exports = Glider;
