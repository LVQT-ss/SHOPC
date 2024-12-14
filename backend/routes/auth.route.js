import expess from 'express';
import {
    login,
    register,
    staffRegister,
    approveStaff,
    getAllPendingStaff,
    managerRegister,
    requestPasswordReset,
    resetPassword,
    rejectStaff
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = expess.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *     - Auth Controller
 *     summary: Register a new user
 *     description: This endpoint allows you to create a new user in the system by providing the necessary details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usertype
 *               - username
 *               - email
 *               - password
 *             properties:
 *               usertype:
 *                 type: string
 *                 enum: ['Staff', 'Customer']
 *                 example: Customer
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@mail.com
 *               password:
 *                 type: string
 *                 example: JohnDoe20!@
 *               userAddress:
 *                 type: string
 *                 example: 123 Main St, Anytown, USA
 *               userPhoneNumber:
 *                 type: string
 *                 example: +1234567890
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User successfully registered!
 *       400:
 *         description: Bad Request - Invalid user input
 *       409:
 *         description: Conflict - User already exists
 *       500:
 *         description: Server Error
 */
router.post('/register', register);


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *     - Auth Controller
 *     summary: Log in a user
 *     description: This endpoint allows a user to log in by providing their username and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     usertype:
 *                       type: string
 *       400:
 *         description: Bad Request - Missing or invalid input
 *       401:
 *         description: Unauthorized - Invalid username or password
 *       500:
 *         description: Server error
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/staff-register:
 *   post:
 *     tags:
 *     - Staff Controller
 *     summary: Register a new staff member with auto-generated password
 *     description: This endpoint allows you to register a new staff member in the system with an auto-generated password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 example: johnstaff
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johnstaff@company.com
 *               userAddress:
 *                 type: string
 *                 example: 123 Staff St, Stafftown, USA
 *               userPhoneNumber:
 *                 type: string
 *                 example: +1234567890
 *     responses:
 *       201:
 *         description: Staff member successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff member successfully registered! Awaiting manager approval.
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     usertype:
 *                       type: string
 *                     userStatus:
 *                       type: string
 *                 generatedPassword:
 *                   type: string
 *                   example: 12345678
 *                   description: Auto-generated 8-digit password
 *       400:
 *         description: Bad Request - Invalid user input
 *       409:
 *         description: Conflict - User already exists
 *       500:
 *         description: Server Error
 */
router.post('/staff-register', staffRegister);

/**
 * @swagger
 * /api/auth/approve-staff/{userId}:
 *   put:
 *     tags:
 *     - Staff Controller
 *     summary: Approve a staff member
 *     description: This endpoint allows an Admin or Manager owner to approve a pending staff member.
 *     security:
 *       - Authorization: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID of the staff member to approve
 *     responses:
 *       200:
 *         description: Staff member successfully approved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff member successfully approved.
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     usertype:
 *                       type: string
 *                     userStatus:
 *                       type: string
 *                 approvedBy:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     usertype:
 *                       type: string
 *       403:
 *         description: Access denied. Only Admins and Manager owners can approve staff.
 *       404:
 *         description: Pending staff member not found.
 *       500:
 *         description: Server Error
 */
router.put('/approve-staff/:userId', verifyToken, approveStaff);
/**
 * @swagger
 * /api/auth/reject-staff/{userId}:
 *   put:
 *     tags:
 *     - Staff Controller
 *     summary: Reject a staff member
 *     description: This endpoint allows an Admin or Manager owner to approve a pending staff member.
 *     security:
 *       - Authorization: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID of the staff member to approve
 *     responses:
 *       200:
 *         description: Staff member successfully approved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Staff member successfully approved.
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     usertype:
 *                       type: string
 *                     userStatus:
 *                       type: string
 *                 approvedBy:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     usertype:
 *                       type: string
 *       403:
 *         description: Access denied. Only Admins and Manager owners can approve staff.
 *       404:
 *         description: Pending staff member not found.
 *       500:
 *         description: Server Error
 */
router.put('/reject-staff/:userId', verifyToken, rejectStaff);


/**
 * @swagger
 * /api/auth/pending-staff:
 *   get:
 *     tags:
 *       - Staff Controller
 *     summary: Retrieve all pending staff members
 *     description: This endpoint retrieves all staff members who have a user status of 'Pending' and are awaiting approval.
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: Successfully retrieved pending staff members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *                   userStatus:
 *                     type: string
 *                     example: "Pending"
 *       403:
 *         description: Unauthorized - User doesn't have permission to view the pending staff members
 *       404:
 *         description: No pending staff members found
 *       500:
 *         description: Server error
 */
router.get('/pending-staff', verifyToken, getAllPendingStaff);

/**
 * @swagger
 * /api/auth/manager-register:
 *   post:
 *     tags:
 *     - Admin Controller
 *     summary: Register a new manager with auto-generated password
 *     description: This endpoint allows you to register a new manager in the system with an auto-generated password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 example: johnManager
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johnManager@company.com
 *               userAddress:
 *                 type: string
 *                 example: 123 Manager St, Managertown, USA
 *               userPhoneNumber:
 *                 type: string
 *                 example: +1234567890
 *     responses:
 *       201:
 *         description: Manager successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Manager successfully registered!
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     usertype:
 *                       type: string
 *                     userStatus:
 *                       type: string
 *                 generatedPassword:
 *                   type: string
 *                   example: 12345678
 *                   description: Auto-generated 8-digit password
 *       400:
 *         description: Bad Request - Invalid user input
 *       409:
 *         description: Conflict - User already exists
 *       500:
 *         description: Server Error
 */
router.post('/manager-register', managerRegister);


/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *     - Auth Controller
 *     summary: Request password reset
 *     description: Allows a user to request a password reset link to be sent to their email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@mail.com
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset email sent successfully.
 *       400:
 *         description: Bad Request - Invalid email
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/forgot-password', requestPasswordReset);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *     - Auth Controller
 *     summary: Reset the password
 *     description: Allows a user to reset their password using a token they received via email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token sent to the user's email
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               newPassword:
 *                 type: string
 *                 description: The new password to be set
 *                 example: NewStrongPassword!23
 *     responses:
 *       200:
 *         description: Password successfully reset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password successfully reset.
 *       400:
 *         description: Bad Request - Invalid token or password
 *       403:
 *         description: Forbidden - Expired or invalid token
 *       500:
 *         description: Server error
 */
router.post('/reset-password', resetPassword);
export default router;