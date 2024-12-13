import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import User from './user.models.js';
import category from './category.model.js';
import orderDetails from './orderDetails.model.js';

const product = sequelize.define('Product', {
    productId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: category,
            key: 'categoryId',
        },
        onDelete: 'CASCADE',
    },
    productName: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    productDescription: {
        type: DataTypes.STRING(256),
        allowNull: false,
    },
    productPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.ENUM('active', 'inActive', 'waiting'),  // Updated values
        defaultValue: 'waiting',
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'Product',
    timestamps: false,
});


// Set up relationships
product.belongsTo(category, { foreignKey: 'categoryId' }); // Each product belongs to a category
category.hasMany(product, { foreignKey: 'categoryId' }); // A category has many products

product.belongsTo(orderDetails, { foreignKey: 'orderDetailsId' }); // Each product belongs to a user
orderDetails.hasMany(product, { foreignKey: 'orderDetailsId' });

export default product;
