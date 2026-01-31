/**
 * Production Database Seeding Script
 * Creates admin and user accounts in the Railway PostgreSQL database
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  // Create PostgreSQL client
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to database');

    // Hash passwords
    console.log('🔐 Hashing passwords...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Delete existing users
    console.log('🗑️  Clearing existing users...');
    await client.query('DELETE FROM users');

    // Insert admin and user
    console.log('👤 Creating admin user...');
    await client.query(`
      INSERT INTO users (id, email, password_hash, name, role, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `, [
      '00000000-0000-0000-0000-000000000001',
      'admin@example.com',
      adminPassword,
      'Admin User',
      'admin',
      true
    ]);
    console.log('✅ Admin user created: admin@example.com / admin123');

    console.log('👤 Creating regular user...');
    await client.query(`
      INSERT INTO users (id, email, password_hash, name, role, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `, [
      '00000000-0000-0000-0000-000000000002',
      'user@example.com',
      userPassword,
      'Regular User',
      'user',
      true
    ]);
    console.log('✅ Regular user created: user@example.com / user123');

    // Create default schema
    console.log('📋 Creating default schema...');
    
    const sections = [
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
    ];

    const globalRules = [
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
    ];

    // Delete existing schemas
    await client.query('DELETE FROM schemas');

    await client.query(`
      INSERT INTO schemas (id, name, version, description, sections, global_rules, is_active, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    `, [
      'default-proposal-schema',
      'Default Proposal Schema',
      '1.0.0',
      'Default schema for business proposals with 4 standard sections',
      JSON.stringify(sections),
      JSON.stringify(globalRules),
      true,
      '00000000-0000-0000-0000-000000000001' // Admin user
    ]);
    console.log('✅ Default schema created');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User:  user@example.com / user123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await client.end();
    console.log('✅ Database connection closed');
  }
}

// Run the seeding
seedDatabase()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });
