'use strict';
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('APP_INFO', {
        APP_ID: {
            type: DataTypes.CHAR(36),
            allowNull: false,
            primaryKey: true
        },
        USER_NAME: {
            type: DataTypes.CHAR(32),
            allowNull: false
        },
        APP_NAME: {
            type: DataTypes.CHAR(32),
            allowNull: false
        },
        NOTEBOOK_PATH: {
            type: DataTypes.CHAR(32),
            allowNull: false
        }
    }, {
        createdAt: false,
        updatedAt: false,
        tableName: 'APP_INFO'
    });
};