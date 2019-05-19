'use strict';
/* eslint-disable new-cap */

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'flights',
      'igc',
      {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        defaultValue: null
      }
    );
  },
  down: queryInterface => {
    return queryInterface.removeColumn('flights', 'igc');
  }
};
