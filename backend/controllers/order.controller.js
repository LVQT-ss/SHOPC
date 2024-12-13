import Order from '../models/order.model.js';
import OrderDetails from '../models/orderDetails.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import sequelize from '../database/db.js';

export const createOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            orderDetails,
            guestAddress,
            guestPhoneNum
        } = req.body;

        // Calculate total order value
        const calculateTotal = (details) => {
            return details.reduce((total, item) => {
                return total + (item.quantity * item.price);
            }, 0).toFixed(2);
        };

        // Create order
        const order = await Order.create({
            userId: req.user.userId, // From auth middleware
            orderNumber: Date.now(), // Unique order number
            orderDate: new Date(),
            orderTotal: calculateTotal(orderDetails),
            guestAddress: guestAddress || req.user.userAddress,
            guestPhoneNum: guestPhoneNum || req.user.userPhoneNumber,
            orderStatus: 'active'
        }, { transaction });

        // Create order details
        const orderDetailsRecords = await Promise.all(orderDetails.map(async (detail) => {
            // Verify product exists and is active
            const product = await Product.findOne({
                where: {
                    productId: detail.productId,
                    isActive: 'active'
                }
            });

            if (!product) {
                throw new Error(`Product ${detail.productId} is not available`);
            }

            return OrderDetails.create({
                orderId: order.orderId,
                productId: detail.productId,
                quantity: detail.quantity,
                price: product.productPrice
            }, { transaction });
        }));

        await transaction.commit();

        res.status(201).json({
            message: 'Order created successfully',
            order: {
                ...order.toJSON(),
                orderDetails: orderDetailsRecords
            }
        });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            message: 'Error creating order',
            error: error.message
        });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        // Check user type for authorization
        if (!['Admin', 'Manager'].includes(req.user.usertype)) {
            return res.status(403).json({
                message: 'Unauthorized access'
            });
        }

        const orders = await Order.findAll({
            include: [
                {
                    model: OrderDetails,
                    include: [Product]
                },
                {
                    model: User,
                    attributes: ['username', 'email']
                }
            ],
            order: [['orderDate', 'DESC']]
        });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

export const getOrdersByUser = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.userId },
            include: [
                {
                    model: OrderDetails,
                    include: [Product]
                }
            ],
            order: [['orderDate', 'DESC']]
        });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching user orders',
            error: error.message
        });
    }
};

export const getActiveOrders = async (req, res) => {
    try {
        // Check user type for authorization
        if (!['Admin', 'Manager'].includes(req.user.usertype)) {
            return res.status(403).json({
                message: 'Unauthorized access'
            });
        }

        const activeOrders = await Order.findAll({
            where: { orderStatus: 'active' },
            include: [
                {
                    model: OrderDetails,
                    include: [Product]
                },
                {
                    model: User,
                    attributes: ['username', 'email']
                }
            ],
            order: [['orderDate', 'DESC']]
        });

        res.status(200).json(activeOrders);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching active orders',
            error: error.message
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            where: {
                orderId: req.params.orderId,
                // Only allow access to own order or for admin/manager
                ...(req.user.usertype !== 'Admin' && req.user.usertype !== 'Manager'
                    ? { userId: req.user.userId }
                    : {})
            },
            include: [
                {
                    model: OrderDetails,
                    include: [Product]
                },
                {
                    model: User,
                    attributes: ['username', 'email']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching order',
            error: error.message
        });
    }
};

export const updateOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { orderId } = req.params;
        const {
            orderDetails,
            guestAddress,
            guestPhoneNum,
            orderStatus
        } = req.body;

        // Find existing order
        const order = await Order.findOne({
            where: {
                orderId,
                ...(req.user.usertype !== 'Admin' && req.user.usertype !== 'Manager'
                    ? { userId: req.user.userId }
                    : {})
            }
        });

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        // Update order details
        await order.update({
            guestAddress: guestAddress || order.guestAddress,
            guestPhoneNum: guestPhoneNum || order.guestPhoneNum,
            orderStatus: orderStatus || order.orderStatus
        }, { transaction });

        // If order details are provided, update or create new order details
        if (orderDetails && orderDetails.length > 0) {
            // Remove existing order details
            await OrderDetails.destroy({
                where: { orderId },
                transaction
            });

            // Create new order details
            await Promise.all(orderDetails.map(async (detail) => {
                const product = await Product.findOne({
                    where: {
                        productId: detail.productId,
                        isActive: 'active'
                    }
                });

                if (!product) {
                    throw new Error(`Product ${detail.productId} is not available`);
                }

                return OrderDetails.create({
                    orderId,
                    productId: detail.productId,
                    quantity: detail.quantity,
                    price: product.productPrice
                }, { transaction });
            }));
        }

        await transaction.commit();

        // Fetch updated order with details
        const updatedOrder = await Order.findOne({
            where: { orderId },
            include: [
                {
                    model: OrderDetails,
                    include: [Product]
                }
            ]
        });

        res.status(200).json({
            message: 'Order updated successfully',
            order: updatedOrder
        });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            message: 'Error updating order',
            error: error.message
        });
    }
};

export const deleteOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { orderId } = req.params;

        // Find existing order
        const order = await Order.findOne({
            where: {
                orderId,
                ...(req.user.usertype !== 'Admin' && req.user.usertype !== 'Manager'
                    ? { userId: req.user.userId }
                    : {})
            }
        });

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        // Soft delete: update order status
        await order.update({
            orderStatus: 'inactive'
        }, { transaction });

        // Optionally, delete associated order details
        await OrderDetails.destroy({
            where: { orderId },
            transaction
        });

        await transaction.commit();

        res.status(200).json({
            message: 'Order deleted successfully'
        });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            message: 'Error deleting order',
            error: error.message
        });
    }
};