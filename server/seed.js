import bcrypt from 'bcryptjs'
import { pool } from './db.js'

// Hashing at seed time rather than committing a hash keeps the bcrypt cost and
// the password itself configurable, and leaves no magic constant in the repo.
const SEED_PASSWORD = process.env.SEED_PASSWORD || 'Password123!'
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10)

const seedUsers = [
  { email: 'tenant_a@example.com', tenantId: 1 },
  { email: 'tenant_b@example.com', tenantId: 2 },
]

export async function seed() {
  const passwordHash = bcrypt.hashSync(SEED_PASSWORD, BCRYPT_ROUNDS)

  for (const user of seedUsers) {
    // Idempotent: re-running refreshes the hash instead of failing on the
    // unique email constraint, so a container restart is always safe.
    await pool.query(
      `INSERT INTO users (email, password_hash, tenant_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [user.email, passwordHash, user.tenantId]
    )
  }

  console.log(`Seeded ${seedUsers.length} users (bcrypt cost ${BCRYPT_ROUNDS}).`)
}
