import pg from 'pg'

export const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://northstar:northstar_dev@localhost:5432/northstar',
})
