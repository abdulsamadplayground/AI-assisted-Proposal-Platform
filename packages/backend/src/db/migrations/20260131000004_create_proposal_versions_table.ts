/**
 * Migration: Create proposal_versions table for version tracking (SQLite compatible)
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
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

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('proposal_versions');
}
