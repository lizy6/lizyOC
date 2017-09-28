'use strict';
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('APP_RESULTS', {
    ID: {
      type: DataTypes.CHAR(32),
      allowNull: false,
      primaryKey: true
    },
    SCHEDULE_NAME: {
      type: DataTypes.CHAR(32),
      allowNull: true
    },
    APP_NAME: {
      type: DataTypes.CHAR(32),
      allowNull: true
    },
    EXECUTE_TIME: {
      type: DataTypes.CHAR(32),
      allowNull: true
    },
    SCHEDULE_TARGET:{
      type: DataTypes.CHAR(32),
      allowNull: true
    },
    EXECUTE_STATUS: {
      type: DataTypes.CHAR(32),
      allowNull: true
    },
    RESULTS_LIST: {
      type: DataTypes.CHAR(255),
      allowNull: true
    },

  }, {
    createdAt: false,
    updatedAt: false,
    tableName: 'APP_RESULTS'
  });
};
