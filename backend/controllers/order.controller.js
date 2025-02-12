import Order from '../model/order.model.js';
import OrderDetails from '../model/orderDetails.model.js';
import Product from '../model/product.model.js';
import User from '../model/user.model.js';
import sequelize from '../database/db.js';
import { Op, fn, col, literal } from 'sequelize';

export const createOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { userId, guestName, guestAddress, guestPhoneNum, guestEmail, payment, totalAmount, orderStatus, orderItems } = req.body;

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
            guestName, guestAddress, guestPhoneNum, guestEmail, payment,
            orderNumber,
            orderDate: Date.now(), // Hardcoded date as requested
            orderTotal: totalAmount,
            orderStatus: orderStatus
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
        const { orderId } = req.params;

        // Validate order ID
        if (!orderId) {
            return res.status(400).json({
                message: 'Order ID is required',
            });
        }

        // Fetch the order
        const order = await Order.findOne({
            where: { orderId },
            include: [
                {
                    model: OrderDetails,
                    as: 'orderDetails',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                        },
                    ],
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['username', 'email'],
                },
            ],
        });

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
            });
        }



        res.status(200).json({
            message: 'Order retrieved successfully',
            order,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching order',
            error: error.message,
        });
    }
};



export const updateOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { orderId } = req.params;
        const { orderDetails, guestAddress, guestPhoneNum, orderStatus } = req.body;

        // Validate order ID
        if (!orderId) {
            return res.status(400).json({
                message: 'Order ID is required',
            });
        }

        // Find the existing order
        const order = await Order.findOne({
            where: {
                orderId,
                ...(req.user.usertype !== 'Admin' && req.user.usertype !== 'Manager'
                    ? { userId: req.user.userId } // Ensure user is authorized
                    : {}),
            },
        });

        if (!order) {
            return res.status(404).json({
                message: 'Order not found or unauthorized access',
            });
        }

        // Update order fields
        await order.update(
            {
                guestAddress: guestAddress || order.guestAddress,
                guestPhoneNum: guestPhoneNum || order.guestPhoneNum,
                orderStatus: orderStatus || order.orderStatus,
            },
            { transaction }
        );

        // Update order details if provided
        if (orderDetails && orderDetails.length > 0) {
            // Delete existing order details
            await OrderDetails.destroy({
                where: { orderId },
                transaction,
            });

            // Validate and create new order details
            const validatedDetails = await Promise.all(
                orderDetails.map(async (detail) => {
                    const product = await Product.findOne({
                        where: {
                            productId: detail.productId,
                            isActive: 'active',
                        },
                    });

                    if (!product) {
                        throw new Error(`Product ${detail.productId} is not available`);
                    }

                    return {
                        ...detail,
                        productPrice: product.productPrice,
                    };
                })
            );

            await Promise.all(
                validatedDetails.map((detail) =>
                    OrderDetails.create(
                        {
                            orderId,
                            productId: detail.productId,
                            quantity: detail.quantity,
                            price: detail.productPrice,
                        },
                        { transaction }
                    )
                )
            );
        }

        await transaction.commit();

        // Fetch updated order with details
        const updatedOrder = await Order.findOne({
            where: { orderId },
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
            ],
        });

        res.status(200).json({
            message: 'Order updated successfully',
            order: updatedOrder,
        });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            message: 'Error updating order',
            error: error.message,
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


export const getOrderStats = async (req, res) => {
    try {

        const totalSalesThisMonth = await Order.sum('orderTotal', {
            where: {
                userId: 1,
                orderDate: {
                    [Op.gte]: fn('DATE_TRUNC', 'month', fn('NOW'))
                }
            }
        });

        res.status(200).json({
            // totalOrdersToday,
            // totalSalesToday: totalSalesToday || 0,
            totalSalesThisMonth: totalSalesThisMonth || 0
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching order statistics',
            error: error.message
        });
    }
};

export const totalOrderToday = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to start of the day (local time)

        const startOfDay = today.toISOString().split("T")[0]; // YYYY-MM-DD format


        const totalOrdersToday = await Order.count({
            where: {
                orderDate: {
                    [Op.gte]: startOfDay // Ensure the query matches correctly
                }
            }
        });

        res.status(200).json({
            message: "Total orders today retrieved successfully",
            totalOrdersToday
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching total orders today",
            error: error.message
        });
    }
};

export const totalSaleToday = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of the day

        const startOfDay = today.toISOString().split("T")[0]; // YYYY-MM-DD format

        const totalSalesToday = await Order.sum('orderTotal', {
            where: {
                orderDate: {
                    [Op.gte]: startOfDay // Matches today's orders
                }
            }
        });

        res.status(200).json({
            message: "Total sales today retrieved successfully",
            totalSalesToday: totalSalesToday || 0
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching total sales today",
            error: error.message
        });
    }
};

export const getLast7DaysSales = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to start of the day
        const last7Days = new Date();
        last7Days.setDate(today.getDate() - 6); // Get the date 6 days ago (includes today)

        const salesData = await Order.findAll({
            attributes: [
                [fn('DATE', col('orderDate')), 'date'],
                [fn('SUM', col('orderTotal')), 'totalSales']
            ],
            where: {
                orderDate: {
                    [Op.between]: [last7Days, today]
                }
            },
            group: [fn('DATE', col('orderDate'))],
            order: [[fn('DATE', col('orderDate')), 'ASC']]
        });

        // Format the response to match chart data structure
        const response = {
            labels: salesData.map(sale => sale.getDataValue('date')),
            data: salesData.map(sale => parseFloat(sale.getDataValue('totalSales')))
        };

        res.status(200).json({
            message: "Sales data for the last 7 days retrieved successfully",
            sales: response
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching sales data",
            error: error.message
        });
    }
};
