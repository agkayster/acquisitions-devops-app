import logger from '#config/logger.js';

/**
 * Arcjet middleware wrapper for Express
 * @param {object} arcjetInstance - Configured Arcjet instance
 * @param {object} options - Additional options for handling
 * @returns {Function} Express middleware function
 */
export function arcjetMiddleware(arcjetInstance, options = {}) {
  return async (req, res, next) => {
    try {
      // Get the decision from Arcjet
      const decision = await arcjetInstance.protect(req, {
        email: req.body?.email, // For email validation on auth routes
        ...options.context,
      });

      // Log the decision for monitoring
      logger.info('Arcjet decision', {
        id: decision.id,
        conclusion: decision.conclusion,
        reason: decision.reason,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });

      // Handle different decision types
      if (decision.isDenied()) {
        // Log the denial with details
        logger.warn('Arcjet request denied', {
          id: decision.id,
          reason: decision.reason,
          ip: req.ip,
          path: req.path,
          results: decision.results,
        });

        // Return appropriate error response
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: decision.reason.resetTime,
          });
        }

        if (decision.reason.isBot()) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Automated requests are not allowed.',
          });
        }

        if (decision.reason.isEmail()) {
          return res.status(400).json({
            error: 'Invalid Email',
            message: 'Please provide a valid email address.',
          });
        }

        if (decision.reason.isShield()) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Request blocked by security rules.',
          });
        }

        // Generic denial response
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Request denied by security policy.',
        });
      }

      // If the request is allowed, continue to next middleware
      next();
    } catch (error) {
      // Log error but don't block the request
      logger.error('Arcjet middleware error', {
        error: error.message,
        stack: error.stack,
        ip: req.ip,
        path: req.path,
      });

      // In case of Arcjet error, allow the request to continue
      // This ensures your app remains available even if Arcjet has issues
      next();
    }
  };
}
