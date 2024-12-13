// src/database/init.js
import sequelize from './db.js';
import User from '../models/user.models.js';
import Pond from '../models/Pond.model.js';
import KoiFish from '../models/Koifish.model.js';
import KoiRecord from '../models/KoiRecord.model.js';
const initDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        // Đồng bộ các mô hình với cơ sở dữ liệu
        await sequelize.sync({ alter: true });
        console.log('Database synchronized.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export default initDB;
