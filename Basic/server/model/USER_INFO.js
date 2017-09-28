'use strict';
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('USER_INFO', {
    USER_ID: {
      type: DataTypes.CHAR(32),
      allowNull: false,
      primaryKey: true
    },
    USER_NAME: {
      type: DataTypes.CHAR(64),
      allowNull: false
    },
    PASSWORD: {
      type: DataTypes.CHAR(32),
      allowNull: false,
      defaultValue: ''
    },
    NOTEBOOK_SERVER_URL: {
      type: DataTypes.CHAR(64),
      allowNull: false
    },
    JUPYTER_TOKEN: {
      type: DataTypes.CHAR(64),
      allowNull: false
    }
  }, {
    createdAt: false,
    updatedAt: false,
    tableName: 'USER_INFO'
  });
};