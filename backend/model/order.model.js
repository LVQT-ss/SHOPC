import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import User from './user.model.js';
import OrderDetails from './orderDetails.model.js';

const Order = sequelize.define('Order', {
    orderId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    orderNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    orderDate: {
        type: DataTypes.DATE,
    },
    orderTotal: {
        type: DataTypes.DECIMAL(10, 2), // More appropriate for monetary values
    },
    guestAddress: {
        type: DataTypes.STRING,
    },
    guestPhoneNum: {
        type: DataTypes.STRING,
    },
    orderStatus: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false,
    }
}, {
    tableName: 'orders', // Corrected table name
    timestamps: false,
});


export default Order;