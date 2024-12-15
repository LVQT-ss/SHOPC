import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/user.model.js';
import { sendPasswordEmail, sendPasswordResetEmail } from '../utils/mailer.js';
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
      userStatus: 'Active'
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

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const passwordMatch = await bcryptjs.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.userId, userType: user.usertype },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: pass, ...userWithoutPassword } = user.dataValues;

    res.status(200).json({
      message: "Login successful",
      token: token,
      user: userWithoutPassword,
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


export const staffRegister = async (req, res) => {
  const { username, email, userAddress, userPhoneNumber } = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: 'Please provide all required fields: username and email.' });
  }

  if (username.length > 50 || email.length > 50 || (userAddress && userAddress.length > 255) || (userPhoneNumber && userPhoneNumber.length > 50)) {
    return res.status(400).json({ message: 'Input data exceeds allowed length.' });
  }

  try {
    const password = generateRandomPassword();
    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await User.create({
      usertype: 'Staff',
      username,
      email,
      password: hashedPassword,
      userAddress: userAddress || null,
      userPhoneNumber: userPhoneNumber || null,
      userStatus: 'Pending'
    });

    // Send email with generated password
    const emailSent = await sendPasswordEmail(email, password, true);

    res.status(201).json({
      message: 'Staff member successfully registered! Awaiting Manager approval.',
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        usertype: user.usertype,
        userStatus: user.userStatus
      },
      emailSent: emailSent // Indicate whether the email was sent successfully
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Username or email already exists. Please choose a different one.' });
    }
    console.error('Error creating staff user:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const approveStaff = async (req, res) => {
  const { userId } = req.params;

  try {
    // Check if the user making the request is an Admin using the decoded token value
    if (req.userType !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Only Admin can approve staff.' });
    }

    // Find the staff member to approve
    const staffMember = await User.findOne({
      where: {
        userId,
        usertype: 'Staff',
        userStatus: 'Pending'
      }
    });

    if (!staffMember) {
      return res.status(404).json({ message: 'Pending staff member not found.' });
    }

    // Update the staff member's status
    staffMember.userStatus = 'Active';
    await staffMember.save();

    res.status(200).json({
      message: 'Staff member successfully approved.',
      user: {
        userId: staffMember.userId,
        username: staffMember.username,
        email: staffMember.email,
        usertype: staffMember.usertype,
        userStatus: staffMember.userStatus
      },
    });
  } catch (err) {
    console.error('Error approving staff member:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const rejectStaff = async (req, res) => {
  const { userId } = req.params;

  try {
    // Check if the user making the request is an Admin using the decoded token value
    if (req.userType !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Only Admin can approve staff.' });
    }

    // Find the staff member to approve
    const staffMember = await User.findOne({
      where: {
        userId,
        usertype: 'Staff',
        userStatus: 'Pending'
      }
    });

    if (!staffMember) {
      return res.status(404).json({ message: 'Pending staff member not found.' });
    }

    // Update the staff member's status
    staffMember.userStatus = 'inActive';
    await staffMember.save();

    res.status(200).json({
      message: 'Staff member successfully approved.',
      user: {
        userId: staffMember.userId,
        username: staffMember.username,
        email: staffMember.email,
        usertype: staffMember.usertype,
        userStatus: staffMember.userStatus
      },
    });
  } catch (err) {
    console.error('Error approving staff member:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getAllPendingStaff = async (req, res) => {
  try {
    // Find all users where usertype is 'Staff' and userStatus is 'Pending'
    const pendingStaff = await User.findAll({
      where: {
        usertype: 'Staff',
        userStatus: 'Pending'
      },
      attributes: ['userId', 'username', 'email', 'userStatus']  // Select specific fields to return
    });

    if (pendingStaff.length === 0) {
      return res.status(404).json({ message: 'No pending staff members found.' });
    }

    res.status(200).json({
      message: 'Pending staff members retrieved successfully.',
      data: pendingStaff
    });
  } catch (err) {
    console.error('Error fetching pending staff members:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const managerRegister = async (req, res) => {
  const { username, email, userAddress, userPhoneNumber } = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: 'Please provide all required fields: username and email.' });
  }

  if (username.length > 50 || email.length > 50 || (userAddress && userAddress.length > 255) || (userPhoneNumber && userPhoneNumber.length > 50)) {
    return res.status(400).json({ message: 'Input data exceeds allowed length.' });
  }

  try {
    const password = generateRandomPassword();
    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await User.create({
      usertype: 'Manager',
      username,
      email,
      password: hashedPassword,
      userAddress: userAddress || null,
      userPhoneNumber: userPhoneNumber || null,
      userStatus: 'Active'
    });

    // Send email with generated password
    const emailSent = await sendPasswordEmail(email, password, false);

    res.status(201).json({
      message: 'Manager successfully registered!',
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        usertype: user.usertype,
        userStatus: user.userStatus
      },
      emailSent: emailSent // Indicate whether the email was sent successfully
    });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Username or email already exists. Please choose a different one.' });
    }
    console.error('Error creating manager user:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

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