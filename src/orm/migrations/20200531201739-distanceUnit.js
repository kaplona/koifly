'use strict';
/* eslint-disable new-cap */

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'pilots',
      'distanceUnit',
      {
        type: Sequelize.ENUM('meters', 'kilometers', 'miles'),
        allowNull: false,
        defaultValue: 'kilometers',
        after: 'altitudeUnit'
      }
    );
  },
  down: queryInterface => {
    return queryInterface.removeColumn('pilots', 'distanceUnit');
  }
};
