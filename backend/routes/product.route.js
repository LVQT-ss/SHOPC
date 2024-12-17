import express from 'express';
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    updateProductActiveStatus,
    deleteProduct,
} from '../controllers/product.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/products/createProduct:
 *   post:
 *     tags:
 *     - Products
 *     summary: Create a new product
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - productName
 *               - productDescription
 *               - productPrice
 *             properties:
 *               categoryId:
 *                 type: integer
 *                 example: 2
 *               productName:
 *                 type: string
 *                 example: "Koi Fish Food"
 *               productDescription:
 *                 type: string
 *                 example: "High-quality food for koi fish"
 *               productPrice:
 *                 type: number
 *                 format: float
 *                 example: 20.99
 *               image:   # New image field
 *                 type: string
 *                 example: "https://example.com/image.png"
 *               isActive:
 *                 type: string
 *                 enum: [ "active", "inActive", "waiting" ]  # Updated enum values
 *                 example: "active"
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad Request - Missing or invalid input
 *       500:
 *         description: Server error
 */
router.post('/createProduct', createProduct);

/**
 * @swagger
 * /api/products/getAllProducts:
 *   get:
 *     tags:
 *     - Products
 *     summary: Get all products
 *     responses:
 *       200:
 *         description: List of products retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/getAllProducts', getAllProducts);



/**
 * @swagger
 * /api/products/getProductById/{productId}:
 *   get:
 *     tags:
 *     - Products
 *     summary: Get a product by ID
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: ID of the product
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/getProductById/:productId', getProductById);

/**
 * @swagger
 * /api/products/updateProduct/{productId}:
 *   put:
 *     tags:
 *     - Products
 *     summary: Update a product by ID
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: ID of the product to update
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
 *               userId:
 *                 type: integer
 *                 example: 1
 *               productName:
 *                 type: string
 *                 example: "Updated Koi Fish Food"
 *               productDescription:
 *                 type: string
 *                 example: "Updated description for koi fish food"
 *               productPrice:
 *                 type: number
 *                 format: float
 *                 example: 25.99
 *               isActive:
 *                 type: string
 *                 enum: [ "active", "inActive", "waiting" ]  # Updated enum values
 *                 example: "active"
 *               image:   # New image field
 *                 type: string
 *                 example: "https://example.com/new_image.png"
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Bad Request - Invalid input
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put('/updateProduct/:productId', updateProduct);

/**
 * @swagger
 * /api/products/updateProductActiveStatus/{productId}:
 *   patch:
 *     tags:
 *     - Products
 *     summary: Update product active status
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: ID of the product to update
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
 *               isActive:
 *                 type: string
 *                 enum: [ "active", "inActive", "waiting" ]  # Updated enum values
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Product active status updated successfully
 *       400:
 *         description: Bad Request - Invalid input
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.patch('/updateProductActiveStatus/:productId', updateProductActiveStatus);

/**
 * @swagger
 * /api/products/deleteProduct/{productId}:
 *   delete:
 *     tags:
 *     - Products
 *     summary: Delete a product by ID
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: ID of the product to delete
 *         schema:
 *           type: integer
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete('/deleteProduct/:productId', deleteProduct);

export default router;
