import express from 'express';
import { createOrder, deleteOrder, getActiveOrders, getAllOrders, getOrderById, getOrdersByUser, updateOrder } from '../controllers/order.controller';



const router = express.Router();

// Create a new order (accessible to authenticated users)
router.post('/create', createOrder);

// Get all orders (admin/manager access)
router.get('/', getAllOrders);

// Get active orders (admin/manager access)
router.get('/active', getActiveOrders);

// Get orders for a specific user
router.get('/user', getOrdersByUser);

// Get a specific order by ID
router.get('/:orderId', getOrderById);

// Update an existing order
router.put('/:orderId', updateOrder);

// Delete an order (soft delete)
router.delete('/:orderId', deleteOrder);

export default router;