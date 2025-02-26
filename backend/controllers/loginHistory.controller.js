import LoginHistory from '../model/loginHistory.model.js';
import User from '../model/user.model.js';
import { Op } from 'sequelize';

// Lấy lịch sử đăng nhập của một user cụ thể
export const getUserLoginHistory = async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    try {
        // Xây dựng điều kiện tìm kiếm
        const whereCondition = { userId };

        // Thêm điều kiện ngày nếu có
        if (startDate || endDate) {
            whereCondition.loginTimestamp = {};

            if (startDate) {
                whereCondition.loginTimestamp[Op.gte] = new Date(startDate);
            }

            if (endDate) {
                whereCondition.loginTimestamp[Op.lte] = new Date(endDate);
            }
        }

        // Tính toán offset cho phân trang
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Lấy lịch sử đăng nhập
        const { count, rows } = await LoginHistory.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit),
            offset,
            order: [['loginTimestamp', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['username', 'email', 'usertype']
                }
            ]
        });

        // Trả về kết quả
        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / parseInt(limit)),
            currentPage: parseInt(page),
            data: rows
        });

    } catch (error) {
        console.error('Error fetching login history:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Lấy chi tiết một lần đăng nhập cụ thể
export const getLoginDetails = async (req, res) => {
    const { loginId } = req.params;

    try {
        const loginDetails = await LoginHistory.findByPk(loginId, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['userId', 'username', 'email', 'usertype']
                }
            ]
        });

        if (!loginDetails) {
            return res.status(404).json({ message: 'Login record not found' });
        }

        res.status(200).json(loginDetails);
    } catch (error) {
        console.error('Error fetching login details:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Lấy tất cả lịch sử đăng nhập (có thể lọc theo thời gian, địa điểm,...)
export const getAllLoginHistory = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        startDate,
        endDate,
        username,
        usertype,
        status,
        latitude,
        longitude,
        radius // radius in kilometers
    } = req.query;

    try {
        // Xây dựng điều kiện tìm kiếm
        let whereCondition = {};
        let userWhereCondition = {};

        // Thêm điều kiện ngày nếu có
        if (startDate || endDate) {
            whereCondition.loginTimestamp = {};

            if (startDate) {
                whereCondition.loginTimestamp[Op.gte] = new Date(startDate);
            }

            if (endDate) {
                whereCondition.loginTimestamp[Op.lte] = new Date(endDate);
            }
        }

        // Thêm điều kiện trạng thái đăng nhập
        if (status) {
            whereCondition.loginStatus = status;
        }

        // Thêm điều kiện tìm kiếm theo username
        if (username) {
            userWhereCondition.username = { [Op.like]: `%${username}%` };
        }

        // Thêm điều kiện tìm kiếm theo usertype
        if (usertype) {
            userWhereCondition.usertype = usertype;
        }

        // Nếu có tọa độ và bán kính, tìm các đăng nhập trong khu vực đó
        // Đây là một phép tính gần đúng dựa trên Haversine formula
        if (latitude && longitude && radius) {
            // 111.32 km - khoảng cách tương đương 1 độ vĩ độ
            const latDelta = parseFloat(radius) / 111.32;
            // Điều chỉnh theo cosine của vĩ độ
            const lngDelta = parseFloat(radius) / (111.32 * Math.cos(parseFloat(latitude) * Math.PI / 180));

            whereCondition.latitude = {
                [Op.between]: [parseFloat(latitude) - latDelta, parseFloat(latitude) + latDelta]
            };
            whereCondition.longitude = {
                [Op.between]: [parseFloat(longitude) - lngDelta, parseFloat(longitude) + lngDelta]
            };
        }

        // Tính toán offset cho phân trang
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Lấy lịch sử đăng nhập
        const { count, rows } = await LoginHistory.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit),
            offset,
            order: [['loginTimestamp', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['username', 'email', 'usertype'],
                    where: Object.keys(userWhereCondition).length > 0 ? userWhereCondition : undefined
                }
            ]
        });

        // Trả về kết quả
        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / parseInt(limit)),
            currentPage: parseInt(page),
            data: rows
        });

    } catch (error) {
        console.error('Error fetching all login history:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};