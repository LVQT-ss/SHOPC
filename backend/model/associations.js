import User from './user.model.js';
import Order from './order.model.js';
import OrderDetails from './orderDetails.model.js';
import Product from './product.model.js';
import Category from './category.model.js';
import Transaction from './transactions.model.js';
import LoginHistory from './loginHistory.model.js';

function setupAssociations() {
    // User and Order Associations
    User.hasMany(Order, {
        foreignKey: 'userId',
        as: 'orders'
    });
    Order.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    // Order and OrderDetails Associations
    Order.hasMany(OrderDetails, {
        foreignKey: 'orderId',
        as: 'orderDetails'
    });
    OrderDetails.belongsTo(Order, {
        foreignKey: 'orderId',
        as: 'order'
    });

    // Order and transactions Associations 
    Transaction.belongsTo(Order, {
        foreignKey: 'orderId',
        as: 'order'
    });
    Order.hasOne(Transaction, {
        foreignKey: 'orderId',
        as: 'transactionId'
    });

    // OrderDetails and Product Associations
    OrderDetails.belongsTo(Product, {
        foreignKey: 'productId',
        as: 'product'
    });
    Product.hasMany(OrderDetails, {
        foreignKey: 'productId',
        as: 'orderDetails'
    });

    // Product and Category Associations
    Product.belongsTo(Category, {
        foreignKey: 'categoryId',
        as: 'category'
    });
    Category.hasMany(Product, {
        foreignKey: 'categoryId',
        as: 'products'
    });

    // User and LoginHistory Associations
    User.hasMany(LoginHistory, {
        foreignKey: 'userId',
        as: 'loginHistory'
    });
    LoginHistory.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });
}

export default setupAssociations;