"use strict";
/**
 * Knex configuration for database migrations
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const config = {
    development: {
        client: process.env.DB_CLIENT || 'sqlite3',
        connection: {
            filename: process.env.DB_FILENAME || path_1.default.join(__dirname, 'dev.sqlite3'),
        },
        useNullAsDefault: true,
        pool: {
            min: 2,
            max: 10,
            afterCreate: (conn, cb) => {
                conn.run('PRAGMA foreign_keys = ON', cb);
            },
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: path_1.default.join(__dirname, 'migrations'),
        },
        seeds: {
            directory: path_1.default.join(__dirname, 'seeds'),
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
            directory: path_1.default.join(__dirname, 'migrations'),
        },
    },
};
exports.default = config;
//# sourceMappingURL=knexfile.js.map