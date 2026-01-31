/**
 * Knex configuration for database migrations
 */

import type { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: process.env.DB_CLIENT || 'sqlite3',
    connection: {
      filename: process.env.DB_FILENAME || path.join(__dirname, 'dev.sqlite3'),
    },
    useNullAsDefault: true,
    pool: {
      min: 2,
      max: 10,
      afterCreate: (conn: any, cb: any) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      },
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
  },

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
      directory: path.join(__dirname, 'migrations'),
    },
  },
};

export default config;
