import express from 'express';
import { createOrder, deleteOrder, getActiveOrders, getAllOrders, getLast7DaysSales, getOrderById, getOrdersByUser, getOrderStats, totalOrderToday, totalSaleToday, updateOrder }
    from '../controllers/order.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/orders/create:
 *   post:
 *     tags:
 *     - Orders
 *     summary: Create a new order
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - guestName
 *               - guestAddress
 *               - guestPhoneNum
 *               - guestEmail
 *               - payment
 *               - totalAmount
 *               - orderStatus
 *               - orderItems
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               guestName:
 *                 type: integer
 *                 example: 1
 *               guestAddress:
 *                 type: integer
 *                 example: 1
 *               guestPhoneNum:
 *                 type: integer
 *                 example: 1
 *               guestEmail:
 *                 type: integer
 *                 example: 1
 *               payment:
 *                 type: integer
 *                 example: 1
 *               totalAmount:
 *                 type: number
 *                 format: float
 *                 example: 99.99
 *               orderStatus:
 *                 type: string
 *                 enum: ['active']
 *                 example: 'active'
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Bad Request - Missing or invalid input
 *       500:
 *         description: Server error
 */
router.post('/create', createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags:
 *     - Orders
 *     summary: Get all orders
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: List of all orders retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', getAllOrders);

/**
 * @swagger
 * /api/orders/active:
 *   get:
 *     tags:
 *     - Orders
 *     summary: Get active orders
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: List of active orders retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/active', getActiveOrders);

/**
 * @swagger
 * /api/orders/user:
 *   get:
 *     tags:
 *     - Orders
 *     summary: Get orders for the current user
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: List of user's orders retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/user', getOrdersByUser);


/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get order statistics including daily, today's, and monthly data
 *     description: Retrieves sales statistics including daily sales for the last 7 days, today's orders and sales, and monthly totals
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dailySales:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2025-02-13"
 *                       orderCount:
 *                         type: integer
 *                         example: 15
 *                       totalSales:
 *                         type: number
 *                         format: float
 *                         example: 2500.50
 *                 todayStats:
 *                   type: object
 *                   properties:
 *                     orderCount:
 *                       type: integer
 *                       example: 5
 *                     totalSales:
 *                       type: number
 *                       format: float
 *                       example: 750.25
 *                 monthlyStats:
 *                   type: object
 *                   properties:
 *                     orderCount:
 *                       type: integer
 *                       example: 45
 *                     totalSales:
 *                       type: number
 *                       format: float
 *                       example: 7500.75
 *       500:
 *         description: Server error
 */
router.get('/stats', getOrderStats);

/**
 * @swagger
 * /api/orders/today/total-orders:
 *   get:
 *     tags:
 *     - Orders
 *     summary: Get total orders placed today
 *     responses:
 *       200:
 *         description: Total orders today retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Total orders today retrieved successfully"
 *                 totalOrdersToday:
 *                   type: integer
 *                   example: 10
 *       500:
 *         description: Server error
 */
router.get('/today/total-orders', totalOrderToday);

/**
 * @swagger
 * /api/orders/today/total-sales:
 *   get:
 *     tags:
 *     - Orders
 *     summary: Get total products sold today
 *     responses:
 *       200:
 *         description: Total sales today retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Total sales today retrieved successfully"
 *                 totalSalesToday:
 *                   type: integer
 *                   example: 25
 *       500:
 *         description: Server error
 */
router.get('/today/total-sales', totalSaleToday);
/**
 * @swagger
 * /api/orders/sales/last7days:
 *   get:
 *     tags:
 *     - Orders
 *     summary: Get sales data for the last 7 days
 *     description: Retrieves total sales for each day in the last 7 days, formatted for charts.
 *     responses:
 *       200:
 *         description: Sales data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sales data for the last 7 days retrieved successfully"
 *                 sales:
 *                   type: object
 *                   properties:
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "2025-02-07"
 *                     data:
 *                       type: array
 *                       items:
 *                         type: number
 *                         format: float
 *                         example: 2500.50
 *       500:
 *         description: Server error
 */
router.get('/sales/last7days', getLast7DaysSales);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     tags:
 *     - Orders
 *     summary: Get a specific order by ID
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: ID of the order to retrieve
 *         schema:
 *           type: integer
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get('/:orderId', getOrderById);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   put:
 *     tags:
 *     - Orders
 *     summary: Update an existing order
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: ID of the order to update
 *         schema:
 *           type: integer
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               totalAmount:
 *                 type: number
 *                 format: float
 *                 example: 129.99
 *               orderStatus:
 *                 type: string
 *                 enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
 *                 example: 'processing'
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 3
 *                     price:
 *                       type: number
 *                       format: float
 *                       example: 43.33
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Bad Request - Invalid input
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put('/:orderId', updateOrder);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   delete:
 *     tags:
 *     - Orders
 *     summary: Delete an order (soft delete)
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: ID of the order to delete
 *         schema:
 *           type: integer
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.delete('/:orderId', deleteOrder);






export default router;