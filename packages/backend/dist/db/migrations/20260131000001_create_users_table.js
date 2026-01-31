"use strict";
/**
 * Migration: Create users table (SQLite compatible)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    return knex.schema.createTable('users', (table) => {
        table.string('id', 36).primary();
        table.string('email', 255).notNullable().unique();
        table.string('password_hash', 255).notNullable();
        table.string('name', 255).notNullable();
        table.string('role', 20).notNullable().defaultTo('user'); // 'user' or 'admin'
        table.string('assigned_schema_id', 255).nullable();
        table.boolean('is_active').notNullable().defaultTo(true);
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
        table.index('email');
        table.index('role');
    });
}
async function down(knex) {
    return knex.schema.dropTableIfExists('users');
}
//# sourceMappingURL=20260131000001_create_users_table.js.map