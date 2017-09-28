'use strict';
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('APP_MAKESCHEDULE', {
    ID: {
      type: DataTypes.CHAR(255),
      allowNull: false,
      primaryKey: true
    },
    APP_ID: {
      type: DataTypes.CHAR(255),
      allowNull: true
    },
    SCHEDULE_NAME: {
      type: DataTypes.CHAR(255),
      allowNull: false
    },
    STATE: {
      type: DataTypes.CHAR(255),
      allowNull: true
    },
    COMMAND: {
      type: DataTypes.CHAR(255),
      allowNull: true
    },
    SECOND: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    MINUTE: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    HOUR: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    DATE: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    MONTH: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    YEAR: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    DAYOFWEEK: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
  }, {
    createdAt: false,
    updatedAt: false,
    tableName: 'APP_SCHEDULE'
  });
};
