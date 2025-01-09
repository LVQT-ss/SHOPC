import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const Order = sequelize.define('Order', {
    orderId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'userId'
        }
    },
    orderDate: {
        type: DataTypes.DATEONLY, // Use DATEONLY to store only the date
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    orderTotal: {
        type: DataTypes.DECIMAL(10, 2),
    },
    guestAddress: {
        type: DataTypes.STRING,
    },
    guestPhoneNum: {
        type: DataTypes.STRING,
    },
    guestName: {
        type: DataTypes.STRING,
    },
    guestEmail: {
        type: DataTypes.STRING,
    },
    payment: {
        type: DataTypes.STRING,
    },

    orderStatus: {
        type: DataTypes.ENUM('active', 'inactive', 'complete'), // Restrict to these 3 values
        defaultValue: 'inactive',
        allowNull: false,
    },
}, {
    tableName: 'orders',
    timestamps: false,
});

export default Order;