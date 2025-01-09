import express from 'express';
import {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    getDailyTransactions,
    getTransactionsByDateRange
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