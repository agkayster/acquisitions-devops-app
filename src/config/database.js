import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import pkg from 'pg';
const { Pool } = pkg;
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import logger from '#config/logger.js';

/**
 * Database configuration that works with both Neon Cloud and Neon Local
 * - In production: Uses Neon serverless HTTP client
 * - In development: Can use either HTTP client or direct PostgreSQL connection
 */

const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

logger.info(`Database configuration loaded for ${NODE_ENV} environment`);

let db, sql;

// Check if we're using a direct PostgreSQL connection (Neon Local)
if (DATABASE_URL.startsWith('postgres://') && NODE_ENV === 'development') {
  logger.info('Using direct PostgreSQL connection for development');
  
  // Direct PostgreSQL connection for Neon Local
  const pool = new Pool({
    connectionString: DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  // Test the connection
  pool.on('connect', () => {
    logger.info('Connected to Neon Local PostgreSQL database');
  });
  
  pool.on('error', (err) => {
    logger.error('PostgreSQL pool error:', err);
  });
  
  db = drizzlePg(pool, { logger: true });
  sql = pool; // For raw queries if needed
} else {
  logger.info('Using Neon serverless HTTP client');
  
  // Neon serverless HTTP client (production or cloud development)
  sql = neon(DATABASE_URL);
  db = drizzle(sql, { logger: true });
}

// Health check function
export async function checkDatabaseConnection() {
  try {
    if (NODE_ENV === 'development' && DATABASE_URL.startsWith('postgres://')) {
      // PostgreSQL health check
      await sql.query('SELECT 1');
    } else {
      // Neon HTTP health check
      await sql('SELECT 1');
    }
    logger.info('Database connection is healthy');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
}

export { db, sql };
