import 'dotenv/config';

/* export configuration for drizzle */
export default {
  schema: './src/models/*.js' /* all schemas would be stored here */,
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};


