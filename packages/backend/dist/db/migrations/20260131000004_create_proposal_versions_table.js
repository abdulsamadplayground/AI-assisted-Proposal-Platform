"use strict";
/**
 * Migration: Create proposal_versions table for version tracking (SQLite compatible)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    return knex.schema.createTable('proposal_versions', (table) => {
        table.string('id', 36).primary();
        table.string('proposal_id', 36).notNullable().references('id').inTable('proposals').onDelete('CASCADE');
        table.integer('version_number').notNullable();
        table.text('sections').notNullable(); // JSON string snapshot of sections at this version
        table.text('change_description').nullable();
        table.string('created_by', 36).notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.unique(['proposal_id', 'version_number']);
        table.index('proposal_id');
        table.index('created_at');
    });
}
async function down(knex) {
    return knex.schema.dropTableIfExists('proposal_versions');
}
//# sourceMappingURL=20260131000004_create_proposal_versions_table.js.map