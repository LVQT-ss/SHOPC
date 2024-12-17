import express from 'express';
import { createOrder, deleteOrder, getActiveOrders, getAllOrders, getOrderById, getOrdersByUser, updateOrder } from '../controllers/order.controller';

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
 *               - totalAmount
 *               - orderStatus
 *               - orderItems
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               totalAmount:
 *                 type: number
 *                 format: float
 *                 example: 99.99
 *               orderStatus:
 *                 type: string
 *                 enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
 *                 example: 'pending'
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
 *                     price:
 *                       type: number
 *                       format: float
 *                       example: 49.99
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