'use strict';
/* eslint-disable new-cap */

module.exports = {
  async up(queryInterface, Sequelize) {
    const flightsOptions = {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      siteId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      altitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      airtime: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      gliderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: ''
      },
      see: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      pilotId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    };

    const sitesOptions = {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100), // eslint-disable-line new-cap
        allowNull: false
      },
      location: {
        type: Sequelize.STRING(1000), // eslint-disable-line new-cap
        allowNull: false,
        defaultValue: ''
      },
      launchAltitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      lat: {
        type: Sequelize.DECIMAL(9, 6), // eslint-disable-line new-cap
        allowNull: true,
        defaultValue: null
      },
      lng: {
        type: Sequelize.DECIMAL(9, 6), // eslint-disable-line new-cap
        allowNull: true,
        defaultValue: null
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: ''
      },
      see: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      pilotId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    };

    const glidersOptions = {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100), // eslint-disable-line new-cap
        allowNull: false
      },
      initialFlightNum: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      initialAirtime: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: ''
      },
      see: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      pilotId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    };

    const pilotsOptions = {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true
      },
      userName: {
        type: Sequelize.STRING(100), // eslint-disable-line new-cap
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      initialFlightNum: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      initialAirtime: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      altitudeUnit: {
        type: Sequelize.ENUM('meters', 'feet'), // eslint-disable-line new-cap
        allowNull: false,
        defaultValue: 'meters'
      },
      token: {
        type: Sequelize.STRING(64), // eslint-disable-line new-cap
        allowNull: true,
        defaultValue: null
      },
      tokenExpirationTime: {
        type: Sequelize.BIGINT(14), // eslint-disable-line new-cap
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
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    };

    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable('pilots', pilotsOptions, { transaction });
      await queryInterface.addIndex('pilots', { fields: [ 'email' ], name: 'pilotEmail', unique: true, transaction });

      await queryInterface.createTable('sites', sitesOptions, { transaction });
      await queryInterface.addIndex('sites', { fields: [ 'pilotId' ], name: 'sitePilotId', transaction });
      await queryInterface.addIndex('sites', { fields: [ 'updatedAt' ], name: 'siteUpdatedAt', transaction });

      await queryInterface.createTable('gliders', glidersOptions, { transaction });
      await queryInterface.addIndex('gliders', { fields: [ 'pilotId' ], name: 'gliderPilotId', transaction });
      await queryInterface.addIndex('gliders', { fields: [ 'updatedAt' ], name: 'gliderUpdatedAt', transaction });

      await queryInterface.createTable('flights', flightsOptions, { transaction });
      await queryInterface.addIndex('flights', { fields: [ 'pilotId' ], name: 'flightPilotId', transaction });
      await queryInterface.addIndex('flights', { fields: [ 'siteId' ], name: 'flightSiteId', transaction });
      await queryInterface.addIndex('flights', { fields: [ 'gliderId' ], name: 'flightGliderId', transaction });
      await queryInterface.addIndex('flights', { fields: [ 'updatedAt' ], name: 'flightUpdatedAt', transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  async down(queryInterface) {
    await queryInterface.dropAllTables();
  }
};
