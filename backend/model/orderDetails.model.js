import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import order from './order.model.js';
import product from './product.model.js';

const orderDetails = sequelize.define('Category', {
    orderDetailsId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    quantity: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.STRING,
    },
}, {
    tableName: 'categories',
    timestamps: false,
});

orderDetails.belongsTo(order, { foreignKey: 'orderId' })

orderDetails.belongsTo(product, { foreignKey: 'productId' })
product.hasMany(orderDetails, { foreignKey: 'productId' })

export default orderDetails;
