import express from 'express'
import authRouter, { getAuthUser } from './auth.js'
import holdingsRouter from './holdings.js'
import { seed } from './seed.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRouter)
app.use('/api/holdings', holdingsRouter)

app.get('/api/me', (req, res) => {
  const user = getAuthUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated.' })
  res.json({ email: user.email, tenantId: user.tenantId })
})

// Compose waits for the database healthcheck before starting this container,
// so the schema from db/init.sql already exists by the time we seed.
seed()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to seed users:', err)
    process.exit(1)
  })
