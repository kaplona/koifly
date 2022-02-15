'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      'flights',
      'igcFileName',
      {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      'flights',
      'igcFileName',
      {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: ''
      }
    );
  }
};
