const errorHandler = (err, req, res, next) => {  // eslint-disable-line no-unused-vars
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server Error';

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        message = 'Resource not found';
        statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
        statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map(val => val.message).join(', ');
        statusCode = 400;
    }

    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'File size exceeds the maximum limit of 10MB';
        statusCode = 400;
    }

    // Multer wrong file type (thrown manually in fileFilter)
    if (err.message === 'Only PDF files are allowed!') {
        statusCode = 400;
    }

    // JWT errors (fallback — auth middleware already handles these inline,
    // but protect against next(err) paths elsewhere)
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token';
        statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        message = 'Token expired';
        statusCode = 401;
    }

    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export default errorHandler;