// models/associations.js
import User from './user.model.js';
import Order from './order.model.js';
import OrderDetails from './orderDetails.model.js';
import Product from './product.model.js';
import Category from './category.model.js';

function setupAssociations() {
    // User and Order Associations
    User.hasMany(Order, {
        foreignKey: 'userId',
        as: 'orders'
    });
    Order.belongsTo(User, {
        foreignKey: 'userId'
    });

    // Order and OrderDetails Associations
    Order.hasMany(OrderDetails, {
        foreignKey: 'orderId',
        as: 'orderDetails'
    });
    OrderDetails.belongsTo(Order, {
        foreignKey: 'orderId'
    });

    // OrderDetails and Product Associations
    OrderDetails.belongsTo(Product, {
        foreignKey: 'productId'
    });
    Product.hasMany(OrderDetails, {
        foreignKey: 'productId',
        as: 'orderDetails'
    });

    // Product and Category Associations
    Product.belongsTo(Category, {
        foreignKey: 'categoryId'
    });
    Category.hasMany(Product, {
        foreignKey: 'categoryId',
        as: 'products'
    });
}

export default setupAssociations;