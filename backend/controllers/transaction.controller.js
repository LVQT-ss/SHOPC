import Transaction from "../model/transactions.model.js";
import Order from "../model/order.model.js";
import { Op } from "sequelize";
import sequelize from '../database/db.js';

export const createTransaction = async (req, res) => {
    const dbTransaction = await sequelize.transaction();

    const { orderId, totalAmount, paymentMethod } = req.body;

    if (!orderId || !totalAmount || !paymentMethod) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const order = await Order.findByPk(orderId, { transaction: dbTransaction });
        if (!order) {
            await dbTransaction.rollback();
            return res.status(404).json({ message: 'Order not found' });
        }

        const totalAmountFromOrder = parseFloat(order.orderTotal);
        if (totalAmount < totalAmountFromOrder) {
            await dbTransaction.rollback();
            return res.status(400).json({ message: 'Received amount is less than order total' });
        }

        if (order.orderStatus !== 'inactive') {
            await dbTransaction.rollback();
            return res.status(400).json({ message: 'Order is not in correct status for transaction' });
        }

        const changeAmount = totalAmount - totalAmountFromOrder;

        const newTransaction = await Transaction.create({
            transactionNumber: `TRX-${Date.now()}`,
            orderId,
            totalAmount: totalAmountFromOrder,
            receivedAmount: totalAmount,
            changeAmount,
            paymentMethod,
            status: 'completed'
        }, { transaction: dbTransaction });

        await order.update({
            orderStatus: 'active',
            payment: paymentMethod
        }, { transaction: dbTransaction });

        const completeTransaction = await Transaction.findByPk(newTransaction.transactionId, {
            include: [{
                model: Order,
                as: 'order',
                attributes: ['orderId', 'orderNumber', 'orderStatus', 'orderTotal', 'payment']
            }],
            transaction: dbTransaction
        });

        await dbTransaction.commit();

        res.status(201).json(completeTransaction);
    } catch (err) {
        await dbTransaction.rollback();
        console.error('Error creating transaction:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// Rest of the controller methods remain the same...
export const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            include: [{
                model: Order,
                attributes: ['orderId', 'orderNumber', 'orderStatus', 'orderTotal', 'payment']
            }],
            order: [['transactionDate', 'DESC']]
        });
        res.status(200).json(transactions);
    } catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.transactionId, {
            include: [{
                model: Order,
                attributes: ['orderId', 'orderNumber', 'orderStatus', 'orderTotal', 'payment']
            }]
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json(transaction);
    } catch (err) {
        console.error('Error fetching transaction:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getDailyTransactions = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const transactions = await Transaction.findAll({
            where: {
                createdAt: {
                    [Op.gte]: today
                }
            },
            include: [{
                model: Order,
                attributes: ['orderId', 'orderNumber', 'orderStatus', 'orderTotal', 'payment']
            }]
        });

        res.status(200).json(transactions);
    } catch (err) {
        console.error('Error fetching daily transactions:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTransactionsByDateRange = async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        const transactions = await Transaction.findAll({
            where: {
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            include: [{
                model: Order,
                attributes: ['orderId', 'orderNumber', 'orderStatus', 'orderTotal', 'payment']
            }]
        });

        res.status(200).json(transactions);
    } catch (err) {
        console.error('Error fetching transactions by date range:', err);
        res.status(500).json({ message: 'Server error' });
    }
};