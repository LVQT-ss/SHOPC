import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';

const OrderDetails = sequelize.define('OrderDetails', {
    orderDetailsId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
    },
}, {
    tableName: 'order_details',
    timestamps: false,
});

export default OrderDetails;