"use strict";
/**
 * Seed: Initial users (admin and regular user)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = seed;
const bcrypt_1 = __importDefault(require("bcrypt"));
async function seed(knex) {
    // Delete existing entries
    await knex('users').del();
    // Hash passwords
    const adminPassword = await bcrypt_1.default.hash('admin123', 10);
    const userPassword = await bcrypt_1.default.hash('user123', 10);
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
//# sourceMappingURL=001_initial_users.js.map