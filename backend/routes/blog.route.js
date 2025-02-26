import express from 'express';
import {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
} from '../controllers/blog.controller.js';

import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

/**
 * @swagger
 * /api/blogs/createBlog:
 *   post:
 *     tags:
 *     - Blogs
 *     summary: Create a new blog
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - blogTitle
 *               - blogContent
 *               - productId
 *             properties:
 *               blogTitle:
 *                 type: string
 *                 example: "How to Care for Koi Fish"
 *               blogContent:
 *                 type: string
 *                 example: "Koi fish require a clean environment and proper feeding..."
 *               productId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       400:
 *         description: Bad Request - Missing or invalid input
 *       500:
 *         description: Server error
 */
router.post('/createBlog', createBlog);

/**
 * @swagger
 * /api/blogs/getAllBlogs:
 *   get:
 *     tags:
 *     - Blogs
 *     summary: Get all blogs
 *     responses:
 *       200:
 *         description: List of blogs retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/getAllBlogs', getAllBlogs);

/**
 * @swagger
 * /api/blogs/getBlogById/{blogId}:
 *   get:
 *     tags:
 *     - Blogs
 *     summary: Get a blog by ID
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         description: ID of the blog
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.get('/getBlogById/:blogId', getBlogById);

/**
 * @swagger
 * /api/blogs/updateBlog/{blogId}:
 *   put:
 *     tags:
 *     - Blogs
 *     summary: Update a blog by ID
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         description: ID of the blog to update
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
 *               blogTitle:
 *                 type: string
 *                 example: "Updated Blog Title"
 *               blogContent:
 *                 type: string
 *                 example: "Updated blog content here..."
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       400:
 *         description: Bad Request - Invalid input
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.put('/updateBlog/:blogId', updateBlog);

/**
 * @swagger
 * /api/blogs/deleteBlog/{blogId}:
 *   delete:
 *     tags:
 *     - Blogs
 *     summary: Delete a blog by ID
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         description: ID of the blog to delete
 *         schema:
 *           type: integer
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.delete('/deleteBlog/:blogId', deleteBlog);

export default router;
