'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'flights',
      'igcFileName',
      {

        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '',
        after: 'igc'
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('flights', 'igcFileName');
  }
};
