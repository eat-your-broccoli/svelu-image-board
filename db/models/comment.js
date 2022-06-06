'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Comment.belongsTo(models.User, {
        foreignKey: 'user',
        onDelete: 'CASCADE'
      });
      Comment.belongsTo(models.Comment, {
        foreignKey: 'parent',
        onDelete: 'CASCADE'
      })
    }
  }
  Comment.init({
    user: DataTypes.INTEGER,
    parent: DataTypes.INTEGER,
    content: DataTypes.STRING(1024)
  }, {
    sequelize,
    modelName: 'Comment',
  });
  return Comment;
};