import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import initDB from './database/init.js';
import swaggerDocs from './utils/swagger.js';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js';
import categoryRoutes from './routes/category.route.js';
import transactionRoutes from './routes/transaction.route.js';
import blogRoutes from './routes/blog.route.js';
import orderRoutes from './routes/order.route.js'
import loginHistoryRouter from './routes/loginHistory.route.js'
import dotenv from 'dotenv';
import setupAssociations from './model/associations.js';
import { initCronJobs } from './utils/cronjobs.js';

// Call this before starting your server
setupAssociations();
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Register the routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/login-history', loginHistoryRouter);

// Initialize and synchronize the database
initDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        // Initialize Swagger docs
        swaggerDocs(app, port);
    });
}).catch(error => {
    console.error('Invalid database connection:', error);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Closing PostgreSQL connection');
    process.exit();
});
// Khởi tạo cronjob
initCronJobs();