import jwt from 'jsonwebtoken';
import { promisify } from 'util';

const verifyAsync = promisify(jwt.verify);

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, error: 'Not authorized, no token' });
    }

    const decoded = await verifyAsync(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    return next();
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError' ? 'Token has expired' :
      error.name === 'JsonWebTokenError' ? 'Invalid token' :
      'Not authorized, token failed';
    return res.status(401).json({ success: false, error: message });
  }
};

export default protect;