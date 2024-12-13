
import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import order from './order.model.js';

const User = sequelize.define('User', {
    userId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    usertype: {
        type: DataTypes.ENUM('Admin', 'Manager', 'Staff', 'Customer'),
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userAddress: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    userPhoneNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    userStatus: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'User',
    timestamps: false,
});

User.hasMany(order, {
    foreignKey: 'userId',
    as: 'orders'
});

export default User;
