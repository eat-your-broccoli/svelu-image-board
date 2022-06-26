const {Sequelize} = require('sequelize');
module.exports = {
  async up({context: queryInterface}) {
    await queryInterface.createTable('Comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
          as: 'user'
        },
        onDelete: 'CASCADE' 
      },
      post: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Posts',
          key: 'id',
          as: 'post'
        },
        onDelete: 'CASCADE' 
      },
      parent: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Comments',
          key: 'id',
          as: 'parent'
        },
        onDelete: 'CASCADE' 
      },
      content: {
        type: Sequelize.STRING(1024),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down({context: queryInterface}) {
    await queryInterface.dropTable('Comments');
  }
};