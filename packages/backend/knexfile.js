/**
 * Knex configuration for database migrations (JavaScript version for Railway)
 */

require('dotenv').config();
const path = require('path');

module.exports = {
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'src/db/migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'src/db/seeds'),
    },
  },
};
