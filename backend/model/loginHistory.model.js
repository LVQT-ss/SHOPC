import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const LoginHistory = sequelize.define('LoginHistory', {
    loginId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'userId'
        }
    },
    loginTimestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    ipAddress: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    deviceInfo: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
    },
    longitude: {
        type: DataTypes.DECIMAL(10, 7),
        allowNull: true,
    },
    locationName: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    loginStatus: {
        type: DataTypes.ENUM('success', 'failed'),
        allowNull: false,
        defaultValue: 'success'
    }
}, {
    tableName: 'login_history',
    timestamps: true,
});

export default LoginHistory;