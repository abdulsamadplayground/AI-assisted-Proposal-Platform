/**
 * Migration: Create schema_versions table for tracking schema edit history
 */

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('schema_versions', (table) => {
    table.string('id', 36).primary();
    table.string('schema_id', 36).notNullable().references('id').inTable('schemas').onDelete('CASCADE');
    table.integer('version_number').notNullable();
    table.string('name', 255).notNullable();
    table.string('version', 50).notNullable();
    table.text('description').nullable();
    table.text('sections').notNullable(); // JSON string of section definitions
    table.text('global_rules').notNullable().defaultTo('[]'); // JSON string of global rules
    table.text('change_summary').nullable(); // Description of what changed
    table.string('created_by', 36).notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    
    table.index('schema_id');
    table.index(['schema_id', 'version_number']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('schema_versions');
}
