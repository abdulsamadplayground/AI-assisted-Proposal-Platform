"use strict";
/**
 * Migration: Create schemas table (SQLite compatible)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    return knex.schema.createTable('schemas', (table) => {
        table.string('id', 36).primary();
        table.string('name', 255).notNullable();
        table.string('version', 50).notNullable().defaultTo('1.0.0');
        table.text('description').nullable();
        table.text('sections').notNullable(); // JSON string of section definitions
        table.text('global_rules').notNullable().defaultTo('[]'); // JSON string of global rules
        table.boolean('is_active').notNullable().defaultTo(true);
        table.string('created_by', 36).notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
        table.index('is_active');
        table.index('created_by');
    });
}
async function down(knex) {
    return knex.schema.dropTableIfExists('schemas');
}
//# sourceMappingURL=20260131000002_create_schemas_table.js.map