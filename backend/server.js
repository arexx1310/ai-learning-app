import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 20;

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandlers.js';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

// ES6 module __dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy — must be first.
// Without this Express sees the internal proxy IP, not the real client IP.
// Rate limiters key on req.ip, so without this all users share one IP.
// Also required for secure cookies to work behind Render / Railway / Heroku.
app.set('trust proxy', 1);

/* ================= COOKIE PARSER ================= */
app.use(cookieParser());

/* ================= SECURITY HEADERS ================= */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: [
          "'self'",
          process.env.FRONTEND_URL,
        ].filter(Boolean),
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: true,
  })
);

/* ================= CORS ================= */
app.use(
  cors({
    origin: [
      'https://ailearnassist.netlify.app',
      'https://ai-learning-app-sigma.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

/* ================= BODY PARSER ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= NoSQL INJECTION SANITIZER ================= */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (/^\$|\./.test(key)) {
      delete obj[key];
    } else {
      sanitizeObject(obj[key]);
    }
  }
};
app.use((req, _res, next) => {
  sanitizeObject(req.body);
  sanitizeObject(req.params);
  sanitizeObject(req.query);
  next();
});

/* ================= STATIC FILES ================= */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ================= RATE LIMITERS ================= */

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 20,
  message: { success: false, message: 'Too many login attempts, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ================= CONNECT DB ================= */
connectDB();

/* ================= ROUTES ================= */
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/documents', apiLimiter, documentRoutes);
app.use('/api/flashcards', apiLimiter, flashcardRoutes);
app.use('/api/ai', apiLimiter, aiRoutes);
app.use('/api/quizzes', apiLimiter, quizRoutes);
app.use('/api/progress', apiLimiter, progressRoutes);

/* ================= 404 HANDLER ================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    statusCode: 404,
  });
});

/* ================= ERROR HANDLER ================= */
app.use(errorHandler);

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});