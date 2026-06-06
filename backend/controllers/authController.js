import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/* ─────────────────────────────────────────────
   TOKEN HELPERS
───────────────────────────────────────────── */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '2d',
  });

// Centralised cookie setter — mirrors Project Portal pattern
const setAuthCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,                        // JS cannot read this
    secure: isProd,                        // HTTPS only in prod
    sameSite: isProd ? 'none' : 'lax',    // 'none' required for cross-origin in prod
    maxAge: 2 * 24 * 60 * 60 * 1000,      // 2 days in ms
    path: '/',                             // Cookie sent for every route
  });
};

/* ─────────────────────────────────────────────
   PASSWORD POLICY HELPERS
───────────────────────────────────────────── */
const PASSWORD_POLICY = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

const validatePassword = (password) => {
  if (!password || typeof password !== 'string' || !password.trim()) {
    return 'Password is required.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (!PASSWORD_POLICY.test(password)) {
    return 'Password must contain an uppercase letter, a number, and a special character.';
  }
  return null; // valid
};

/* ─────────────────────────────────────────────
   REGISTER
   POST /api/auth/register
   Public
───────────────────────────────────────────── */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({ success: false, error: 'Username is required.' });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ success: false, error: passwordError });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: userExists.email === email
          ? 'Email already registered.'
          : 'Username already taken.',
      });
    }

    const user = await User.create({ username: username.trim(), email: email.trim().toLowerCase(), password });
    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        },
        // token intentionally omitted from body — sent via httpOnly cookie
      },
      message: 'User registered successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────
   LOGIN
   POST /api/auth/login
   Public
───────────────────────────────────────────── */
export const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password.trim()
    ) {
      return res.status(400).json({ success: false, error: 'Please provide email and password.' });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
      message: 'Login successful.',
    });
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────
   LOGOUT
   POST /api/auth/logout
   Private
───────────────────────────────────────────── */
export const logout = (_req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  // Overwrite cookie with empty value and maxAge 0 — more reliable than clearCookie
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 0,
    path: '/',
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

/* ─────────────────────────────────────────────
   GET PROFILE
   GET /api/auth/profile
   Private
───────────────────────────────────────────── */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────
   UPDATE PROFILE
   PUT /api/auth/profile
   Private
───────────────────────────────────────────── */
export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, profileImage } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Check uniqueness BEFORE mutating the user object
    if (username || email) {
      const orConditions = [];
      if (username) orConditions.push({ username });
      if (email) orConditions.push({ email });

      const conflict = await User.findOne({
        $or: orConditions,
        _id: { $ne: req.user.id },
      });

      if (conflict) {
        const field = email && conflict.email === email ? 'Email' : 'Username';
        return res.status(400).json({ success: false, error: `${field} already in use.` });
      }
    }

    if (username) user.username = username;
    if (email) user.email = email.trim().toLowerCase();
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────
   CHANGE PASSWORD
   POST /api/auth/change-password
   Private
───────────────────────────────────────────── */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== 'string' ||
      typeof newPassword !== 'string' ||
      !currentPassword.trim() ||
      !newPassword.trim()
    ) {
      return res.status(400).json({ success: false, error: 'Please provide current and new password.' });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ success: false, error: passwordError });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    }

    // Prevent reusing the same password
    if (await user.matchPassword(newPassword)) {
      return res.status(400).json({ success: false, error: 'New password must differ from current password.' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};