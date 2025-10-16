import logger from '#config/logger.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your_jwt_secret_key_please_change_in_production';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/* create jwt token and export it at the same time */
export const jwttoken = {
  sign: payload => {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    } catch (error) {
      logger.error('Failed to authenticate token. Error signing JWT:', error);
      throw new Error('Failed to authenticate token');
    }
  },
  verify: token => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error('Failed to verify token. Error verifying JWT:', error);
      throw new Error('Failed to verify token');
    }
  },
};
