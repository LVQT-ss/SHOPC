import Transaction from "../model/transactions.model.js";
import Order from "../model/order.model.js";
import { Op } from "sequelize";
import sequelize from '../database/db.js';
import crypto from 'crypto';
import querystring from 'querystring';
import dotenv from 'dotenv';
import QRCode from "qrcode";
import OrderDetails from "../model/orderDetails.model.js";
import Product from "../model/product.model.js";
dotenv.config();

export const generateVietQR = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        // 🔹 Fetch order details
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // 🔹 Get total price from OrderDetails
        const orderDetails = await OrderDetails.findAll({ where: { orderId } });
        if (!orderDetails.length) {
            return res.status(404).json({ message: "No order details found" });
        }

        // 🔹 Calculate total price
        const totalPrice = orderDetails.reduce((sum, detail) => sum + parseFloat(detail.price || 0), 0);

        // 🔹 Get bank account details from .env
        const { ACCOUNT_NAME, ACCOUNT_NUMBER, BANK_CODE } = process.env;
        if (!ACCOUNT_NAME || !ACCOUNT_NUMBER || !BANK_CODE) {
            return res.status(500).json({ message: "Bank details are missing in .env file" });
        }

        // 🔹 Generate VietQR URL
        const vietQRUrl = `https://img.vietqr.io/image/MB-0328789712-qr_only.png?amount=30&addInfo=Order-95`;

        // 🔹 Generate QR Code as base64 image
        const qrCodeBase64 = await QRCode.toDataURL(vietQRUrl);

        // 🔹 Return QR code URL & Base64
        res.status(200).json({
            message: "VietQR Code generated successfully",
            vietQRUrl,
            qrCodeBase64,
            orderId,
            totalPrice,
        });
    } catch (error) {
        console.error("Error generating VietQR:", error);
        res.status(500).json({ message: "Error generating VietQR", error: error.message });
    }
};


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

// export const generateVietQR = async (req, res) => {
//     try {
//         const { orderId, paymentMethod } = req.body;

//         if (!orderId || !paymentMethod) {
//             return res.status(400).json({ message: "Missing orderId or paymentMethod" });
//         }

//         const order = await Order.findByPk(orderId);
//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         if (order.orderStatus !== "inactive") {
//             return res.status(400).json({ message: "Order is not in correct status for payment" });
//         }

//         const totalAmount = parseFloat(order.orderTotal);
//         const transaction = await Transaction.create({
//             transactionNumber: `TRX-${Date.now()}`,
//             orderId,
//             totalAmount,
//             paymentMethod,
//             status: "pending",
//         });

//         // Thông tin tài khoản ngân hàng nhận tiền
//         const bankInfo = {
//             bankCode: process.env.BANK_CODE,
//             accountNumber: process.env.ACCOUNT_NUMBER,
//             accountName: process.env.ACCOUNT_NAME,
//             amount: totalAmount,
//             description: `Thanh toan don hang ${orderId}`,
//         };

//         // URL VietQR (Giả lập API hoặc sử dụng dịch vụ của ngân hàng)
//         const vietQRUrl = `https://api.vietqr.io/v2/generate?qrData=${encodeURIComponent(JSON.stringify(bankInfo))}`;
//         const qrCode = await QRCode.toDataURL(vietQRUrl);

//         res.status(200).json({
//             qrCode,
//             transactionId: transaction.transactionId,
//             message: "QR code generated successfully",
//         });

//     } catch (error) {
//         console.error("Error generating VietQR:", error);
//         res.status(500).json({ message: "Error generating VietQR", error: error.message });
//     }
// };


export const checkPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.query;
        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        // Tìm giao dịch trong database
        const transaction = await Transaction.findOne({ where: { orderId } });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Giả lập kiểm tra thanh toán từ ngân hàng (Hoặc gọi API ngân hàng nếu có)
        const isPaid = Math.random() > 0.5; // Giả lập 50% đã thanh toán

        if (isPaid) {
            await transaction.update({ status: "completed" });

            // Cập nhật trạng thái đơn hàng
            await Order.update({ orderStatus: "complete" }, { where: { orderId } });

            return res.status(200).json({ message: "Payment confirmed", status: "completed" });
        } else {
            return res.status(200).json({ message: "Payment pending", status: "pending" });
        }
    } catch (error) {
        console.error("Error checking payment status:", error);
        res.status(500).json({ message: "Error checking payment status", error: error.message });
    }
};
