const knex = require('knex');
const path = require('path');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'src/db/dev.sqlite3')
  },
  useNullAsDefault: true
});

async function seedSchema() {
  try {
    console.log('Deleting existing schemas...');
    await db('schemas').del();
    
    console.log('Inserting default schema...');
    await db('schemas').insert([
      {
        id: 'default-proposal-schema',
        name: 'Default Proposal Schema',
        version: '1.0.0',
        description: 'Default schema for business proposals with 4 standard sections',
        sections: JSON.stringify([
          {
            name: 'executive_summary',
            display_name: 'Executive Summary',
            description: 'High-level overview of the proposal',
            order: 1,
            required: true,
            min_length: 200,
            max_length: 1000,
            output_format: 'paragraph',
            rules: [
              {
                name: 'length_check',
                type: 'length',
                description: 'Must be between 200-1000 characters',
                parameters: { min: 200, max: 1000 },
                severity: 'error'
              }
            ]
          },
          {
            name: 'scope_of_work',
            display_name: 'Scope of Work',
            description: 'Detailed description of work to be performed',
            order: 2,
            required: true,
            min_length: 300,
            max_length: 2000,
            output_format: 'bullet_points',
            rules: [
              {
                name: 'length_check',
                type: 'length',
                description: 'Must be between 300-2000 characters',
                parameters: { min: 300, max: 2000 },
                severity: 'error'
              }
            ]
          },
          {
            name: 'timeline',
            display_name: 'Project Timeline',
            description: 'Project schedule and milestones',
            order: 3,
            required: true,
            min_length: 200,
            max_length: 1500,
            output_format: 'timeline',
            rules: [
              {
                name: 'length_check',
                type: 'length',
                description: 'Must be between 200-1500 characters',
                parameters: { min: 200, max: 1500 },
                severity: 'error'
              }
            ]
          },
          {
            name: 'pricing',
            display_name: 'Pricing',
            description: 'Cost breakdown and pricing details',
            order: 4,
            required: true,
            min_length: 200,
            max_length: 1500,
            output_format: 'structured',
            rules: [
              {
                name: 'length_check',
                type: 'length',
                description: 'Must be between 200-1500 characters',
                parameters: { min: 200, max: 1500 },
                severity: 'error'
              }
            ]
          }
        ]),
        global_rules: JSON.stringify([
          {
            name: 'no_placeholder_text',
            type: 'content',
            description: 'Must not contain placeholder text like [INSERT], TBD, etc.',
            parameters: { forbidden_patterns: ['\\[INSERT\\]', 'TBD', 'TODO', '\\[\\.\\.\\.]'] },
            severity: 'error'
          },
          {
            name: 'professional_tone',
            type: 'style',
            description: 'Must maintain professional business tone',
            parameters: {},
            severity: 'warning'
          }
        ]),
        is_active: true,
        created_by: '00000000-0000-0000-0000-000000000001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
    
    console.log('✅ Default schema seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding schema:', error);
    process.exit(1);
  }
}

seedSchema();
