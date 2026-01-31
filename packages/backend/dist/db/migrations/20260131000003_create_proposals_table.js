"use strict";
/**
 * Migration: Create proposals table (SQLite compatible)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    return knex.schema.createTable('proposals', (table) => {
        table.string('id', 36).primary();
        table.string('title', 500).notNullable();
        table.string('schema_id', 36).notNullable().references('id').inTable('schemas').onDelete('RESTRICT');
        table.string('user_id', 36).notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.string('status', 50).notNullable().defaultTo('draft'); // 'draft', 'pending_approval', 'approved', 'rejected'
        table.integer('current_version').notNullable().defaultTo(1);
        table.text('survey_notes').notNullable();
        table.text('sections').notNullable(); // JSON string of generated sections
        table.text('attachments').notNullable().defaultTo('[]'); // JSON string of file references
        table.text('admin_comments').nullable();
        table.string('reviewed_by', 36).nullable().references('id').inTable('users').onDelete('SET NULL');
        table.timestamp('submitted_at').nullable();
        table.timestamp('reviewed_at').nullable();
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
        table.index('user_id');
        table.index('schema_id');
        table.index('status');
        table.index('created_at');
    });
}
async function down(knex) {
    return knex.schema.dropTableIfExists('proposals');
}
//# sourceMappingURL=20260131000003_create_proposals_table.js.map