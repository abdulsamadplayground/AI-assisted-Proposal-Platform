const knex = require('knex');
const path = require('path');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'src/db/dev.sqlite3')
  },
  useNullAsDefault: true
});

async function resetDatabase() {
  try {
    console.log('Disabling foreign keys...');
    await db.raw('PRAGMA foreign_keys = OFF');
    
    console.log('Deleting all data...');
    await db('proposal_versions').del();
    await db('proposals').del();
    await db('schemas').del();
    await db('users').del();
    
    console.log('Re-enabling foreign keys...');
    await db.raw('PRAGMA foreign_keys = ON');
    
    console.log('Inserting seed users...');
    const bcrypt = require('bcrypt');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    
    await db('users').insert([
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'admin@example.com',
        password_hash: adminPassword,
        name: 'Admin User',
        role: 'admin',
        is_active: true,
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'user@example.com',
        password_hash: userPassword,
        name: 'Regular User',
        role: 'user',
        is_active: true,
      },
    ]);
    
    console.log('✅ Database reset successfully!');
    console.log('Users created:');
    console.log('  - admin@example.com (ID: 00000000-0000-0000-0000-000000000001)');
    console.log('  - user@example.com (ID: 00000000-0000-0000-0000-000000000002)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();
