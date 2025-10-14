import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

/* initialize the neon client */
const sql = neon(process.env.DATABASE_URL);

/* initialize the drizzle orm */
const db = drizzle(sql, { logger: true });

export { db, sql };
