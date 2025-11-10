import logger from '#config/logger.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

// Verify JWT token and attach user to request
export const authenticate = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = cookies.get(req, 'token');

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required',
        error: 'No authentication token provided',
      });
    }

    // Verify token
    const decoded = jwttoken.verify(token);

    if (!decoded) {
      return res.status(401).json({
        message: 'Authentication failed',
        error: 'Invalid or expired token',
      });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    logger.info(`User authenticated: ${req.user.email}`);
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      message: 'Authentication failed',
      error: 'Invalid or expired token',
    });
  }
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required',
      error: 'User not authenticated',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied',
      error: 'Admin privileges required',
    });
  }

  logger.info(`Admin access granted: ${req.user.email}`);
  next();
};

// Check if user owns the resource or is admin
export const isOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required',
      error: 'User not authenticated',
    });
  }

  const { id } = req.params;

  // Convert both to strings for comparison
  const requestedUserId = +id;
  const authenticatedUserId = +req.user.userId;
  // const requestedUserId = String(id);
  // const authenticatedUserId = String(req.user.userId);

  // Allow if user is admin or owns the resource
  if (req.user.role === 'admin' || authenticatedUserId === requestedUserId) {
    logger.info(`Access granted to user: ${req.user.email}`);
    return next();
  }

  return res.status(403).json({
    message: 'Access denied',
    error: 'You can only modify your own account',
  });
};
