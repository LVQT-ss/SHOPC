import express from 'express';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/category.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/categories/createCategory:
 *   post:
 *     tags:
 *     - Categories
 *     summary: Create a new category
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: "Pet Supplies"
 *               categoryType:
 *                 type: string
 *                 example: "Pets"
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad Request - Missing or invalid input
 *       500:
 *         description: Server error
 */
router.post('/createCategory', createCategory);

/**
 * @swagger
 * /api/categories/getAllCategories:
 *   get:
 *     tags:
 *     - Categories
 *     summary: Get all categories
 *     responses:
 *       200:
 *         description: List of categories retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/getAllCategories', getAllCategories);

/**
 * @swagger
 * /api/categories/getCategoryById/{categoryId}:
 *   get:
 *     tags:
 *     - Categories
 *     summary: Get a category by ID
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: ID of the category
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get('/getCategoryById/:categoryId', getCategoryById);

/**
 * @swagger
 * /api/categories/updateCategory/{categoryId}:
 *   put:
 *     tags:
 *     - Categories
 *     summary: Update a category by ID
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: ID of the category to update
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
 *               categoryName:
 *                 type: string
 *                 example: "Updated Pet Supplies"
 *               categoryType:
 *                 type: string
 *                 example: "Pet Care"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Bad Request - Invalid input
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.put('/updateCategory/:categoryId', updateCategory);

/**
 * @swagger
 * /api/categories/deleteCategory/{categoryId}:
 *   delete:
 *     tags:
 *     - Categories
 *     summary: Delete a category by ID
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: ID of the category to delete
 *         schema:
 *           type: integer
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.delete('/deleteCategory/:categoryId', deleteCategory);

export default router;