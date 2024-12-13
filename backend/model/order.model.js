import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import User from './user.model.js';
import orderDetails from './orderDetails.model.js';

const order = sequelize.define('Category', {
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
        type: DataTypes.STRING,
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
    tableName: 'categories',
    timestamps: false,
});

order.belongsTo(User, { foreignKey: 'userId' })
User.hasMany(order, { foreignKey: 'userId' })


order.hasMany(orderDetails, { foreignKey: 'orderId' })
orderDetails.belongsTo(order, { foreignKey: 'orderId' })
export default order;
