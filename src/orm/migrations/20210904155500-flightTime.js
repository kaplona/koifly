'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'flights',
      'time',
      {
        type: Sequelize.TIME,
        allowNull: true,
        defaultValue: null,
        after: 'date'
      }
    );
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.removeColumn('flights', 'time');
  }
};
