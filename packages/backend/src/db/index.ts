/**
 * Database connection instance
 */

import knex from 'knex';
import config from './knexfile';

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

export const db = knex(dbConfig);

// Test database connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

export default db;
