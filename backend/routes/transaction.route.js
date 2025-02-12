import express from 'express';
import {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    getDailyTransactions,
    getTransactionsByDateRange,
    createVNPayPayment,
    vnpayReturn
} from '../controllers/transaction.controller.js';

const router = express.Router();


/**
 * @swagger
 * /api/transactions/create:
 *   post:
 *     tags:
 *     - Transactions
 *     summary: Create a new transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - totalAmount
 *               - paymentMethod
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 1
 *               totalAmount:
 *                 type: number
 *                 format: float
 *                 example: 50000
 *               paymentMethod:
 *                 type: string
 *                 enum: ["cash", "qr_code"]
 *               status:
 *                 type: string
 *                 enum: ["pending", "completed", "cancelled"]
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Bad Request
 */
router.post('/create', createTransaction);
/**
 * @swagger
 * /api/transactions/vnpay/create:
 *   post:
 *     tags:
 *       - VNPay
 *     summary: Create a VNPay payment URL
 *     description: Generates a VNPay payment link for an order.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: VNPay payment URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentUrl:
 *                   type: string
 *                   example: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=500000&vnp_TxnRef=TRX-1234567890"
 *       400:
 *         description: Invalid request or missing parameters
 */
router.post('/vnpay/create', createVNPayPayment);


/**
 * @swagger
 * /api/transactions/vnpay/return:
 *   get:
 *     tags:
 *       - VNPay
 *     summary: Verify VNPay transaction
 *     description: Handles the VNPay callback and verifies the transaction status.
 *     parameters:
 *       - in: query
 *         name: vnp_TxnRef
 *         required: true
 *         schema:
 *           type: string
 *         example: "TRX-1234567890"
 *       - in: query
 *         name: vnp_ResponseCode
 *         required: true
 *         schema:
 *           type: string
 *         example: "00"
 *       - in: query
 *         name: vnp_Amount
 *         required: true
 *         schema:
 *           type: integer
 *         example: 500000
 *       - in: query
 *         name: vnp_SecureHash
 *         required: true
 *         schema:
 *           type: string
 *         example: "securehashvalue"
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Payment verification failed
 */
router.get('/vnpay/return', vnpayReturn);


/**
 * @swagger
 * /api/transactions/all:
 *   get:
 *     tags:
 *     - Transactions
 *     summary: Get all transactions
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/all', getAllTransactions);

/**
 * @swagger
 * /api/transactions/{transactionId}:
 *   get:
 *     tags:
 *     - Transactions
 *     summary: Get transaction by ID
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:transactionId', getTransactionById);


/**
 * @swagger
 * /api/transactions/daily:
 *   get:
 *     tags:
 *     - Transactions
 *     summary: Get daily transactions summary
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/daily', getDailyTransactions);

/**
 * @swagger
 * /api/transactions/range:
 *   get:
 *     tags:
 *     - Transactions
 *     summary: Get transactions by date range
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/range', getTransactionsByDateRange);

export default router;