import express from 'express';
import {
    getUserLoginHistory,
    getLoginDetails,
    getAllLoginHistory
} from '../controllers/loginHistory.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/login-history/user/{userId}:
 *   get:
 *     tags:
 *     - Login History
 *     summary: Get login history for a specific user
 *     description: Retrieve login history records for a specific user with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Login history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', getUserLoginHistory);

/**
 * @swagger
 * /api/login-history/{loginId}:
 *   get:
 *     tags:
 *     - Login History
 *     summary: Get details for a specific login
 *     description: Retrieve details for a specific login record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loginId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The login record ID
 *     responses:
 *       200:
 *         description: Login details retrieved successfully
 *       404:
 *         description: Login record not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:loginId', getLoginDetails);

/**
 * @swagger
 * /api/login-history:
 *   get:
 *     tags:
 *     - Login History
 *     summary: Get all login history
 *     description: Retrieve all login history records with filtering and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Filter by username (partial match)
 *       - in: query
 *         name: usertype
 *         schema:
 *           type: string
 *         description: Filter by user type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [success, failed]
 *         description: Filter by login status
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Center latitude for location search
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Center longitude for location search
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Search radius in kilometers
 *     responses:
 *       200:
 *         description: Login history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', getAllLoginHistory);

export default router;