import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { fileURLToPath} from 'url';
import connectDB from './config/db.js';
import errorHandler from './middleware/erroHandlers.js';

import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';



//ES6 module __dirname aternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Initialize express app

const app = express();
app.set('trust proxy', 1);

//Connect to MongoDB
connectDB();

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST","PUT","DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({extended:true}));


//Static Folder for uploads
app.use('/uploads',express.static(path.join(__dirname,'uploads')));

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 requests per IP
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 5, // 5 attempts
  message: 'Too many login attempts, try again later',
});

// Routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/documents', apiLimiter, documentRoutes);
app.use('/api/flashcards', apiLimiter, flashcardRoutes);
app.use('/api/ai', apiLimiter, aiRoutes);
app.use('/api/quizzes', apiLimiter, quizRoutes);
app.use('/api/progress', apiLimiter, progressRoutes);


app.use(errorHandler);


//404 handler

app.use((req,res)=>{
    res.status(404).json({
        sucess:false,
        error: "Route not found",
        statusCode: 404
    });
});

//Start Server

const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=>{
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err)=>{
    console.error(`Error: ${err.message}`);
    process.exit(1);
});