import Order from '../model/order.model.js';
import OrderDetails from '../model/orderDetails.model.js';
import Product from '../model/product.model.js';
import User from '../model/user.model.js';
import sequelize from '../database/db.js';

export const createOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { userId, totalAmount, orderStatus, orderItems } = req.body;

        // Validate input
        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({
                message: 'Invalid order details'
            });
        }

        // Validate products before creating order
        const validatedProducts = await Promise.all(orderItems.map(async (detail) => {
            const product = await Product.findOne({
                where: {
                    productId: detail.productId
                }
            });

            // More comprehensive product validation
            if (!product) {
                throw new Error(`Product ${detail.productId} not found`);
            }

            // Check if product is active
            if (product.isActive !== 'active') {
                throw new Error(`Product ${detail.productId} is not available`);
            }

            // Validate quantity and price
            if (detail.quantity <= 0) {
                throw new Error(`Invalid quantity for product ${detail.productId}`);
            }

            return {
                ...detail,
                productPrice: product.productPrice
            };
        }));

        // Generate a more robust order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        // Create order with formatted date
        const order = await Order.create({
            userId,
            orderNumber,
            orderDate: '2024-12-18', // Hardcoded date as requested
            orderTotal: totalAmount,
            orderStatus: orderStatus || 'pending'
        }, { transaction });

        // Create order details
        const orderDetailsRecords = await Promise.all(validatedProducts.map(detail =>
            OrderDetails.create({
                orderId: order.orderId,
                productId: detail.productId,
                quantity: detail.quantity,
                price: detail.productPrice
            }, { transaction })
        ));

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
        const orders = await Order.findAll({
            include: [
                {
                    model: OrderDetails,
                    as: 'orderDetails', // Specify the alias defined in the association
                    include: [
                        {
                            model: Product,
                            as: 'product', // Specify the alias defined in the association
                        },
                    ],
                },
                {
                    model: User,
                    as: 'user', // Specify the alias defined in the association
                    attributes: ['username', 'email'],
                },
            ],
            order: [['orderDate', 'DESC']],
        });

        res.status(200).json({
            message: 'Orders retrieved successfully',
            orders,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching orders',
            error: error.message,
        });
    }
};



export const getOrdersByUser = async (req, res) => {
    try {
        // Ensure user is authenticated


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
        // Enhanced authorization check


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
        // Validate order ID
        if (!req.params.orderId) {
            return res.status(400).json({
                message: 'Order ID is required'
            });
        }

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
                message: 'Order not found or unauthorized access'
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

        // Validate order ID
        if (!orderId) {
            return res.status(400).json({
                message: 'Order ID is required'
            });
        }

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
                message: 'Order not found or unauthorized access'
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

            // Create new order details with validation
            const validatedDetails = await Promise.all(orderDetails.map(async (detail) => {
                const product = await Product.findOne({
                    where: {
                        productId: detail.productId,
                        isActive: 'active'
                    }
                });

                if (!product) {
                    throw new Error(`Product ${detail.productId} is not available`);
                }

                return {
                    ...detail,
                    productPrice: product.productPrice
                };
            }));

            // Create new order details
            await Promise.all(validatedDetails.map(detail =>
                OrderDetails.create({
                    orderId,
                    productId: detail.productId,
                    quantity: detail.quantity,
                    price: detail.productPrice
                }, { transaction })
            ));
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

        // Validate order ID
        if (!orderId) {
            return res.status(400).json({
                message: 'Order ID is required'
            });
        }

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
                message: 'Order not found or unauthorized access'
            });
        }

        // Soft delete: update order status
        await order.update({
            orderStatus: 'inactive'
        }, { transaction });

        // Delete associated order details
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