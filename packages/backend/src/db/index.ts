/**
 * Database connection instance
 */

import knex, { Knex } from 'knex';
import config from './knexfile';

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

let dbInstance: Knex | null = null;
let connectionError: Error | null = null;

// Initialize database connection
try {
  dbInstance = knex(dbConfig);
  
  // Test database connection (async, won't block)
  dbInstance.raw('SELECT 1')
    .then(() => {
      console.log('✅ Database connected successfully');
    })
    .catch((err) => {
      console.error('❌ Database connection failed:', err.message);
      connectionError = err;
    });
} catch (err) {
  console.error('❌ Database initialization failed:', err);
  connectionError = err as Error;
}

// Export a proxy that throws helpful errors if DB is not configured
export const db = new Proxy({} as Knex, {
  get(target, prop) {
    if (!dbInstance) {
      throw new Error(
        'Database not configured. Please set up PostgreSQL and add DB_HOST, DB_NAME, DB_USER, DB_PASSWORD environment variables.'
      );
    }
    return (dbInstance as any)[prop];
  }
});

export default db;
