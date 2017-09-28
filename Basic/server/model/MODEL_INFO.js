'use strict';
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('MODEL_INFO', {
    MODEL_ID: {
      type: DataTypes.CHAR(32),
      allowNull: false,
      primaryKey: true
    },
    USER_NAME: {
      type: DataTypes.CHAR(32),
      allowNull: false
    },
    VIEW_MENU_ID: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    TYPE_MENU_ID: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    MODEL_NAME: {
      type: DataTypes.CHAR(64),
      allowNull: false
    },
    NOTEBOOK_PATH: {
      type: DataTypes.CHAR(64),
      allowNull: false
    },
    MODEL_INFO: {
      type: DataTypes.CHAR(256),
      allowNull: true
    },
    APP_ID: {
      type: DataTypes.CHAR(256),
      allowNull: true
    },
    UPDATED_TIME: {
      type: DataTypes.DATE(),
      allowNull: false
    },
    COMMENT: {
      type: DataTypes.CHAR(256),
      allowNull: false
    },
    FILE_PATH: {
      type: DataTypes.CHAR(11),
      allowNull: true
    },
    KERNEL:{
      type: DataTypes.CHAR(45),
      allowNull: true
    }
  }, {
    createdAt: false,
    updatedAt: false,
    tableName: 'MODEL_INFO'
  });
};
