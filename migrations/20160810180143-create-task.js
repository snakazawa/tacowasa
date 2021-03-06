'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      projectId: {
        allowNull: false,
        type: Sequelize.STRING
      },
      stageId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      nextTaskId: {
        type: Sequelize.INTEGER
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING
      },
      body: {
        allowNull: false,
        defaultValue: '',
        type: Sequelize.STRING
      },
      costId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      isWorking: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    },
    {
      engine: process.env.NODE_ENV === 'test' ? 'MYISAM' : 'InnoDB',
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('tasks');
  }
};
