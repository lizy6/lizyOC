'use strict';
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('APP_MAKEFILE', {
    ID: {
      type: DataTypes.CHAR(32),
      allowNull: false,
      primaryKey: true
    },
    USER_NAME: {
      type: DataTypes.CHAR(32),
      allowNull: true
    },
    APP_ID: {
      type: DataTypes.CHAR(256),
      allowNull: true
    },
    MAKEFILE_ID: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    PREREQUISITES: {
      type: DataTypes.CHAR(255),
      allowNull: true
    },
    TARGET: {
      type: DataTypes.CHAR(255),
      allowNull: true
    },
    FLAG: {
      type: DataTypes.CHAR(255),
      allowNull: true
    },
  }, {
    createdAt: false,
    updatedAt: false,
    tableName: 'APP_MAKEFILE'
  });
};