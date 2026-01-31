/**
 * Seed: Initial users (admin and regular user)
 */

import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Delete existing entries
  await knex('users').del();

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // Insert seed entries
  await knex('users').insert([
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
}
