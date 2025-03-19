import Order from '../model/order.model.js';
import OrderDetails from '../model/orderDetails.model.js';
import Product from '../model/product.model.js';
import User from '../model/user.model.js';
import sequelize from '../database/db.js';
import { Op, fn, col, literal } from 'sequelize';
import Transaction from '../model/transactions.model.js';
import QRCode from 'qrcode';
import axios from 'axios';
import dotenv from 'dotenv';
import schedule from 'node-schedule';
dotenv.config();
// Map to track order scanning jobs
const orderScanningJobs = new Map();


export const createOrder = async (req, res) => {
    const dbTransaction = await sequelize.transaction();

    try {
        const { userId, guestName, guestAddress, guestPhoneNum, guestEmail, payment, orderStatus, orderItems } = req.body;

        // Validate input
        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            await dbTransaction.rollback();
            return res.status(400).json({
                message: 'Invalid order details'
            });
        }

        // Validate products and calculate total
        let calculatedTotal = 0;
        let validatedProducts;

        try {
            validatedProducts = await Promise.all(orderItems.map(async (detail) => {
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

                // Validate quantity
                if (detail.quantity <= 0) {
                    throw new Error(`Invalid quantity for product ${detail.productId}`);
                }

                // Add to calculated total
                calculatedTotal += product.productPrice * detail.quantity;
                return {
                    ...detail,
                    productPrice: product.productPrice
                };
            }));
        } catch (error) {
            await dbTransaction.rollback();
            return res.status(400).json({
                message: error.message
            });
        }

        // Generate a more robust order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const transactionNumber = `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        // Create order with automatically calculated total
        const order = await Order.create({
            userId,
            guestName,
            guestAddress,
            guestPhoneNum,
            guestEmail,
            payment,
            orderNumber,
            orderDate: Date.now(),
            orderTotal: calculatedTotal,
            orderStatus: orderStatus || 'inactive', // Start with inactive status until payment
        }, { transaction: dbTransaction });

        // Create order details
        const orderDetailsRecords = await Promise.all(validatedProducts.map(detail =>
            OrderDetails.create({
                orderId: order.orderId,
                productId: detail.productId,
                quantity: detail.quantity,
                price: detail.productPrice
            }, { transaction: dbTransaction })
        ));

        // Automatically create a transaction record
        const transactionRecord = await Transaction.create({
            transactionNumber,
            orderId: order.orderId,
            totalAmount: calculatedTotal,
            paymentMethod: payment || 'qr_code', // Default to qr_code if not specified
            status: 'pending'
        }, { transaction: dbTransaction });

        // Commit the transaction before generating QR code
        await dbTransaction.commit();

        // Generate VietQR URL - do this after transaction is committed
        const vietQRUrl = `https://img.vietqr.io/image/MB-0328789712-qr_only.png?amount=${calculatedTotal}&addInfo=AnhempcproStore-${transactionNumber}`;

        let qrCodeBase64;
        try {
            // Generate QR code as base64 - do this after transaction is committed
            qrCodeBase64 = await QRCode.toDataURL(vietQRUrl);
        } catch (qrError) {
            console.error("Error generating QR code:", qrError);
            // Even if QR code generation fails, the order and transaction were created successfully
            qrCodeBase64 = null;
        }

        // Start scanning for payment for this order
        startPaymentScanning(order.orderId, transactionNumber);

        res.status(201).json({
            message: 'Order created successfully',
            order: {
                ...order.toJSON(),
                orderDetails: orderDetailsRecords
            },
            transaction: transactionRecord,
            payment: {
                vietQRUrl
            }
        });
    } catch (error) {
        // Only rollback if the transaction hasn't been committed yet
        if (dbTransaction && !dbTransaction.finished) {
            await dbTransaction.rollback();
        }
        res.status(500).json({
            message: 'Error creating order',
            error: error.message
        });
    }
};



// Modified getLatestCassoTransaction function to handle the 2 most recent transactions
export const getLatestCassoTransaction = async (req, res) => {
    try {
        console.log("Fetching latest transaction from Casso...");
        // Sắp xếp theo thời gian gần nhất (sort=des) và kích thước trang là 1 để lấy giao dịch mới nhất
        const cassoApiUrl = "https://oauth.casso.vn/v2/transactions?pageSize=1&sort=DESC";
        const apiKey = process.env.CASSO_API_KEY;

        const response = await axios.get(cassoApiUrl, {
            headers: { Authorization: `Apikey ${apiKey}` }
        });

        console.log("Casso API Response:", response.data);

        if (!response.data || response.data.error !== 0) {
            console.error("Failed to fetch transaction data from Casso");
            return res.status(500).json({ message: "Failed to fetch transaction data from Casso" });
        }

        const latestTransaction = response.data.data.records[0];
        console.log("Latest Transaction:", latestTransaction);

        res.status(200).json({
            message: "Latest transaction retrieved successfully",
            transaction: latestTransaction
        });
    } catch (error) {
        console.error("Error fetching latest transaction from Casso:", error);
        res.status(500).json({
            message: "Error fetching latest transaction from Casso",
            error: error.message
        });
    }
};













// Function to start scanning for payment
// Function to start scanning for payment
const startPaymentScanning = async (orderId, transactionNumber) => {
    console.log(`Starting payment scanning for order ${orderId} with transaction ${transactionNumber}`);

    // Cancel existing job for this order if it exists
    if (orderScanningJobs.has(orderId)) {
        orderScanningJobs.get(orderId).cancel();
    }

    // Extract the numeric part of the transaction number without dashes
    // For example, convert "TRX-1742326741127-6rspa" to "17423267411276rspa"
    const cleanTransactionNumber = transactionNumber.replace(/TRX-|-/g, "");
    console.log(`Clean transaction number to search for: ${cleanTransactionNumber}`);

    let scanCount = 0;
    const maxScans = 7; // Will scan 7 times over 10 minutes (approx every 1.5 minutes)
    const scanInterval = 90000; // 1.5 minutes in milliseconds

    // Create a proper recurring function using setInterval
    const intervalId = setInterval(async function () {
        try {
            scanCount++;
            console.log(`Scan #${scanCount} for order ${orderId}`);

            // Get the latest transaction from Casso
            const cassoApiUrl = "https://oauth.casso.vn/v2/transactions?pageSize=5&sort=DESC";
            const apiKey = process.env.CASSO_API_KEY;

            const response = await axios.get(cassoApiUrl, {
                headers: { Authorization: `Apikey ${apiKey}` }
            });

            if (!response.data || response.data.error !== 0) {
                console.error("Failed to fetch transactions from Casso");
                return;
            }

            const records = response.data.data.records;
            if (records.length === 0) {
                console.log("No transactions found");
                return;
            }

            // Check if transaction number exists in any transaction description with improved matching
            const matchingTransaction = records.find(transaction => {
                if (!transaction.description) return false;

                console.log('Checking transaction:', transaction.id);
                console.log('Description:', transaction.description);

                // Two ways to match:
                // 1. Full transaction number with dashes (original way)
                const exactMatch = transaction.description.includes(transactionNumber);

                // 2. Without dashes and prefix (new way)
                const fuzzyMatch = transaction.description.includes(cleanTransactionNumber);

                // Log the results
                console.log('Exact match found?', exactMatch);
                console.log('Fuzzy match found?', fuzzyMatch);

                return exactMatch || fuzzyMatch;
            });

            if (matchingTransaction) {
                console.log(`Payment found for order ${orderId}: ${matchingTransaction.id}`);
                console.log(`Transaction description: ${matchingTransaction.description}`);

                // Update transaction status to completed
                await Transaction.update(
                    { status: 'completed' },
                    { where: { orderId } }
                );

                // Update order status to complete
                await Order.update(
                    { orderStatus: 'complete' },
                    { where: { orderId } }
                );

                console.log(`Order ${orderId} marked as complete`);

                // Cancel the interval as payment is confirmed
                clearInterval(intervalId);
                orderScanningJobs.delete(orderId);
                return;
            }

            // If reached max scans, cancel the job and mark as failed
            if (scanCount >= maxScans) {
                console.log(`Payment scanning timeout for order ${orderId}`);

                // Update transaction status to cancelled
                await Transaction.update(
                    { status: 'cancelled' },
                    { where: { orderId } }
                );

                // Update order status to inactive
                await Order.update(
                    { orderStatus: 'inactive' },
                    { where: { orderId } }
                );

                console.log(`Order ${orderId} marked as inactive due to payment timeout`);

                // Cancel the interval
                clearInterval(intervalId);
                orderScanningJobs.delete(orderId);
            }
        } catch (error) {
            console.error(`Error scanning for payment for order ${orderId}:`, error);
        }
    }, scanInterval);

    // Store the interval ID reference in a Map to be able to cancel it later
    orderScanningJobs.set(orderId, {
        cancel: () => clearInterval(intervalId)
    });

    // Set a timeout to cancel the interval after 10 minutes if it hasn't been cancelled already
    setTimeout(() => {
        if (orderScanningJobs.has(orderId)) {
            clearInterval(intervalId);
            orderScanningJobs.delete(orderId);

            // Check and update if order is still pending after 10 minutes
            const checkAndUpdateExpiredOrder = async () => {
                try {
                    const transaction = await Transaction.findOne({
                        where: { orderId, status: 'pending' }
                    });

                    if (transaction) {
                        // Update transaction status to cancelled
                        await Transaction.update(
                            { status: 'cancelled' },
                            { where: { orderId } }
                        );

                        // Update order status to inactive
                        await Order.update(
                            { orderStatus: 'inactive' },
                            { where: { orderId } }
                        );

                        console.log(`Order ${orderId} expired and marked as inactive`);
                    }
                } catch (error) {
                    console.error(`Error updating expired order ${orderId}:`, error);
                }
            };

            checkAndUpdateExpiredOrder();
        }
    }, 10 * 60 * 1000); // 10 minutes in milliseconds
};

// Add a function to manually check payment status - useful for debugging or customer support
export const checkOrderPayment = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Fetch the order and transaction
        const order = await Order.findOne({ where: { orderId } });
        const transaction = await Transaction.findOne({ where: { orderId } });

        if (!order || !transaction) {
            return res.status(404).json({
                message: 'Order or transaction not found'
            });
        }

        // Extract the numeric part of the transaction number without dashes
        const cleanTransactionNumber = transaction.transactionNumber.replace(/TRX-|-/g, "");
        console.log(`Clean transaction number to search for: ${cleanTransactionNumber}`);

        // Get the latest transaction from Casso
        const cassoApiUrl = "https://oauth.casso.vn/v2/transactions?pageSize=5&sort=DESC";
        const apiKey = process.env.CASSO_API_KEY;

        const response = await axios.get(cassoApiUrl, {
            headers: { Authorization: `Apikey ${apiKey}` }
        });

        if (!response.data || response.data.error !== 0) {
            return res.status(500).json({
                message: "Failed to fetch transactions from Casso"
            });
        }

        const records = response.data.data.records;

        // Check if transaction number exists in any transaction description with improved matching
        const matchingTransaction = records.find(cassoTx => {
            if (!cassoTx.description) return false;

            // Two ways to match:
            // 1. Full transaction number with dashes (original way)
            const exactMatch = cassoTx.description.includes(transaction.transactionNumber);

            // 2. Without dashes and prefix (new way)
            const fuzzyMatch = cassoTx.description.includes(cleanTransactionNumber);

            return exactMatch || fuzzyMatch;
        });

        if (matchingTransaction) {
            // Update status if needed
            if (transaction.status === 'pending') {
                await Transaction.update(
                    { status: 'completed' },
                    { where: { orderId } }
                );

                await Order.update(
                    { orderStatus: 'complete' },
                    { where: { orderId } }
                );
            }

            return res.status(200).json({
                message: 'Payment found and confirmed',
                orderStatus: 'complete',
                transactionStatus: 'completed',
                paymentDetails: matchingTransaction
            });
        }

        res.status(200).json({
            message: 'Payment not found',
            orderStatus: order.orderStatus,
            transactionStatus: transaction.status
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error checking payment status',
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


export const inactiveOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { orderId } = req.params;

        // Validate order ID
        if (!orderId) {
            return res.status(400).json({
                message: 'Order ID is required'
            });
        }

        // Find existing order - không kiểm tra người dùng nữa
        const order = await Order.findOne({
            where: { orderId }
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

        // Find existing order - không kiểm tra người dùng nữa
        const order = await Order.findOne({
            where: { orderId }
        });

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        // Hard delete order
        await Order.destroy({
            where: { orderId },
            transaction
        });

        // Delete associated order details
        await OrderDetails.destroy({
            where: { orderId },
            transaction
        });

        await transaction.commit();

        res.status(200).json({
            message: 'Order permanently deleted successfully'
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
