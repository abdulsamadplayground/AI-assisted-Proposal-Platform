/**
 * Database connection instance
 */

import knex, { Knex } from 'knex';
import config from './knexfile';

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

// Initialize database connection
export const db: Knex = knex(dbConfig);

// Test database connection (async, won't block)
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

export default db;
