import express from 'express';
import { body, validationResult } from 'express-validator';
import {
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

/* ─────────────────────────────────────────────
   VALIDATION RUNNER
   Must be used after every validation chain.
   Without this, express-validator collects errors
   but nothing ever reads or rejects them.
───────────────────────────────────────────── */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: errors.array()[0].msg, // return first error, consistent with controller shape
        });
    }
    return next();
};

/* ─────────────────────────────────────────────
   VALIDATION CHAINS
───────────────────────────────────────────── */
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })                                         // matches controller policy
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage('Password must contain an uppercase letter, a number, and a special character'),
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

const updateProfileValidation = [
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters'),
    body('profileImage')
        .optional()
        .isURL()
        .withMessage('Profile image must be a valid URL'),
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters')
        .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage('New password must contain an uppercase letter, a number, and a special character'),
];

/* ─────────────────────────────────────────────
   ROUTES
───────────────────────────────────────────── */

// Public
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

// Private
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidation, validate, updateProfile);
router.post('/change-password', protect, changePasswordValidation, validate, changePassword);

export default router;