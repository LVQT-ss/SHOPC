import { DataTypes } from 'sequelize';
import sequelize from '../database/db.js';
import Product from './product.model.js';

const Blog = sequelize.define('Blog', {
    blogId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    blogTitle: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    blogContent: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.ENUM('active', 'inActive'),
        defaultValue: 'active',
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product,
            key: 'productId',
        },
        onDelete: 'CASCADE',
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    
}, {
    tableName: 'blogs',
    timestamps: false,
});

export default Blog;
