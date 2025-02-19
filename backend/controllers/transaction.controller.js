import Transaction from "../model/transactions.model.js";
import Order from "../model/order.model.js";
import { Op } from "sequelize";
import sequelize from '../database/db.js';
import crypto from 'crypto';
import querystring from 'querystring';
import dotenv from 'dotenv';
import QRCode from "qrcode";
dotenv.config();


export const generateQRCode = async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    const transaction = await Transaction.create({
        transactionNumber: `TRX-${Date.now()}`,
        orderId,
        totalAmount: order.orderTotal,
        paymentMethod: "qr_code",
        status: "pending",
    });

    const paymentUrl = `https://your-payment-gateway.com/pay?transactionId=${transaction.transactionId}`;
    const qrCodeData = await QRCode.toDataURL(paymentUrl);

    res.status(200).json({ qrCode: qrCodeData, transactionId: transaction.transactionId });
};

export const checkPaymentStatus = async (req, res) => {
    const { transactionId } = req.query;

    if (!transactionId) {
        return res.status(400).json({ message: "Transaction ID is required" });
    }

    const transaction = await Transaction.findByPk(transactionId);

    if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ status: transaction.status });
};


export const createTransaction = async (req, res) => {
    const dbTransaction = await sequelize.transaction();

    const { orderId, paymentMethod } = req.body; // Remove totalAmount from req.body

    if (!orderId || !paymentMethod) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const order = await Order.findByPk(orderId, { transaction: dbTransaction });

        if (!order) {
            await dbTransaction.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        const totalAmountFromOrder = parseFloat(order.orderTotal);

        if (order.orderStatus !== 'inactive') {
            await dbTransaction.rollback();
            return res.status(400).json({ message: 'Order is not in correct status for transaction' });
        }

        // Create transaction ensuring totalAmount is strictly from orderTotal
        const newTransaction = await Transaction.create({
            transactionNumber: `TRX-${Date.now()}`,
            orderId,
            totalAmount: totalAmountFromOrder, // Use orderTotal only
            receivedAmount: totalAmountFromOrder, // Prevent manual input
            paymentMethod,
            status: 'pending'
        }, { transaction: dbTransaction });

        await order.update({
            orderStatus: 'active',
            payment: paymentMethod
        }, { transaction: dbTransaction });

        await dbTransaction.commit();
        res.status(201).json(newTransaction);
    } catch (err) {
        await dbTransaction.rollback();
        console.error('Error creating transaction:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const createVNPayPayment = async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    const totalAmount = parseFloat(order.orderTotal) * 100; // Convert to VNPay format

    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    let vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Amount: totalAmount,
        vnp_CurrCode: "VND",
        vnp_TxnRef: `TRX-${Date.now()}`,
        vnp_OrderInfo: `Payment for order ${orderId}`,
        vnp_OrderType: "billpayment",
        vnp_Locale: "vn",
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: req.ip,
        vnp_CreateDate: new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14),
    };

    // ✅ Sort the parameters alphabetically by key before signing
    vnp_Params = Object.fromEntries(Object.entries(vnp_Params).sort());

    // ✅ Create hash using HMAC SHA512
    const signData = querystring.stringify(vnp_Params, "&", "=");
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    vnp_Params["vnp_SecureHash"] = signed;

    const paymentUrl = `${vnpUrl}?${querystring.stringify(vnp_Params)}`;

    res.status(200).json({ paymentUrl });
};


export const vnpayReturn = async (req, res) => {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    const secretKey = process.env.VNP_HASHSECRET;

    // ✅ Sort parameters alphabetically before signing
    vnp_Params = Object.fromEntries(Object.entries(vnp_Params).sort());

    // ✅ Generate signature
    const signData = querystring.stringify(vnp_Params, "&", "=");
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    console.log("Generated Signature:", signed);
    console.log("Received SecureHash:", secureHash);

    if (secureHash !== signed) {
        return res.status(400).json({ message: "Invalid signature" });
    }

    if (vnp_Params["vnp_ResponseCode"] === "00") {
        const transaction = await Transaction.findOne({
            where: { transactionNumber: vnp_Params["vnp_TxnRef"] }
        });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        await transaction.update({ status: "completed" });
        return res.status(200).json({ message: "Payment successful", transaction });
    } else {
        return res.status(400).json({ message: "Payment failed" });
    }
};



// Rest of the controller methods remain the same...
export const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            include: [{
                model: Order,
                attributes: ['orderId', 'orderNumber', 'orderStatus', 'orderTotal', 'payment']
            }],
            order: [['transactionDate', 'DESC']]
        });
        res.status(200).json(transactions);
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.transactionId, {
            include: [{
                model: Order,
                attributes: ['orderId', 'orderNumber', 'orderStatus', 'orderTotal', 'payment']
            }]
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json(transaction);
    } catch (err) {
        console.error('Error fetching transaction:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getDailyTransactions = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const transactions = await Transaction.findAll({
            where: {
                createdAt: {
                    [Op.gte]: today
                }
            },
            include: [{
                model: Order,
                attributes: ['orderId', 'orderNumber', 'orderStatus', 'orderTotal', 'payment']
            }]
        });

        res.status(200).json(transactions);
    } catch (err) {
        console.error('Error fetching daily transactions:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTransactionsByDateRange = async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        const transactions = await Transaction.findAll({
            where: {
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            include: [{
                model: Order,
                attributes: ['orderId', 'orderNumber', 'orderStatus', 'orderTotal', 'payment']
            }]
        });

        res.status(200).json(transactions);
    } catch (err) {
        console.error('Error fetching transactions by date range:', err);
        res.status(500).json({ message: 'Server error' });
    }
};