import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import Category from './category.model.js';

const Product = sequelize.define('Product', {
    productId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
        type: DataTypes.DECIMAL(10, 2), // More precise for monetary values
        allowNull: false,
    },
    isActive: {
        type: DataTypes.ENUM('active', 'inActive'),
        defaultValue: 'active',
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    warranty: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'products', // More conventional naming
    timestamps: false,
});



export default Product;