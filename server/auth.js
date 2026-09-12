import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from './db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

// Every protected route calls this and scopes its queries to the returned
// tenantId. The tenant is read from the signed token, never from the request
// body or URL, so a caller cannot ask for another tenant's data.
export function getAuthUser(req) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return null
  try {
    return jwt.verify(header.slice(7), JWT_SECRET)
  } catch {
    return null
  }
}

const router = Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const result = await pool.query(
    `SELECT u.id, u.email, u.password_hash, u.tenant_id, t.name AS tenant_name
     FROM users u
     JOIN tenants t ON t.id = u.tenant_id
     WHERE u.email = $1`,
    [email]
  )

  const user = result.rows[0]
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const token = jwt.sign(
    { userId: user.id, tenantId: user.tenant_id, email: user.email },
    JWT_SECRET,
    { expiresIn: '8h' }
  )

  res.json({
    token,
    user: {
      email: user.email,
      tenantId: user.tenant_id,
      tenantName: user.tenant_name,
    },
  })
})

export default router
