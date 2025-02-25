import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/user.model.js';
import { sendPasswordEmail, sendPasswordResetEmail } from '../utils/mailer.js';
import LoginHistory from '../model/LoginHistory.model.js';
import 'dotenv/config'

export const register = async (req, res) => {
  const { usertype, username, email, password, userAddress, userPhoneNumber } = req.body;

  if (!usertype || !username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  const validusertypes = ['Customer'];
  if (!validusertypes.includes(usertype)) {
    return res.status(400).json({ message: 'Invalid usertype. Must be one of  Staff, Customer.' });
  }

  if (username.length > 50 || email.length > 50 || password.length > 50 || (userAddress && userAddress.length > 255) || (userPhoneNumber && userPhoneNumber.length > 50)) {
    return res.status(400).json({ message: 'Input data exceeds allowed length.' });
  }

  try {
    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await User.create({
      usertype,
      username,
      email,
      password: hashedPassword,
      userAddress: userAddress || null,
      userPhoneNumber: userPhoneNumber || null,
    });

    res.status(201).json({ message: 'User successfully registered!', user });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Username or email already exists. Please choose a different one.' });
    }
    console.error('Error creating user:', err);
    res.status(500).send(err.message);
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  const { latitude, longitude, deviceInfo } = req.body; // Thêm thông tin vị trí và thiết bị
  const ipAddress = req.ip || req.connection.remoteAddress;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      // Lưu lại thông tin đăng nhập thất bại
      await LoginHistory.create({
        userId: null, // Không có user
        loginTimestamp: new Date(),
        ipAddress,
        deviceInfo: deviceInfo || null,
        latitude: latitude || null,
        longitude: longitude || null,
        loginStatus: 'failed'
      });

      return res.status(401).json({ message: "Invalid username or password" });
    }

    const passwordMatch = await bcryptjs.compare(password, user.password);

    if (!passwordMatch) {
      // Lưu lại thông tin đăng nhập thất bại
      await LoginHistory.create({
        userId: user.userId,
        loginTimestamp: new Date(),
        ipAddress,
        deviceInfo: deviceInfo || null,
        latitude: latitude || null,
        longitude: longitude || null,
        loginStatus: 'failed'
      });

      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Nếu đăng nhập thành công, lưu thông tin đăng nhập
    const locationData = await getLocationName(latitude, longitude); // Hàm này sẽ được định nghĩa sau

    const loginHistory = await LoginHistory.create({
      userId: user.userId,
      loginTimestamp: new Date(),
      ipAddress,
      deviceInfo: deviceInfo || null,
      latitude: latitude || null,
      longitude: longitude || null,
      locationName: locationData?.formattedAddress || null,
      loginStatus: 'success'
    });

    const token = jwt.sign(
      {
        userId: user.userId,
        usertype: user.usertype,
        email: user.email,
        image: user.image,
        address: user.userAddress,
        phone: user.userPhoneNumber
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: pass, ...userWithoutPassword } = user.dataValues;

    res.status(200).json({
      message: "Login successful",
      token: token,
      user: userWithoutPassword,
      loginId: loginHistory.loginId
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Hàm để lấy tên địa điểm từ tọa độ GPS
// Có thể sử dụng Google Maps API hoặc các dịch vụ khác
async function getLocationName(latitude, longitude) {
  if (!latitude || !longitude) return null;

  try {
    // Đây là một ví dụ sử dụng Google Maps Geocoding API
    // Bạn cần thay YOUR_API_KEY bằng khóa API của bạn
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return {
        formattedAddress: data.results[0].formatted_address,
        components: data.results[0].address_components
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
}


// Function generate 9 digit
const generateRandomPassword = () => {
  const digits = '0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += digits[Math.floor(Math.random() * digits.length)];
  }
  return password;
};


export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please provide an email address.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Email not found.' });
    }

    // Create a JWT token for password reset with a short expiration time (e.g., 1 hour)
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Generate reset link with token
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Send the password reset email with the token link
    await sendPasswordResetEmail(user.email, resetLink);

    res.status(200).json({ message: 'Password reset email has been sent.' });
  } catch (error) {
    console.error('Error processing password reset request:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    // Find the user using the userId from the token
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Hash the new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password has been successfully reset.' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset link has expired. Please request a new password reset.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid reset token.' });
    }
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
};