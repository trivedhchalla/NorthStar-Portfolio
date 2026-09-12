import { Router } from 'express'
import multer from 'multer'
import { getAuthUser } from './auth.js'
import { pool } from './db.js'
import { parseHoldingsCsv } from './validateCsv.js'
import { calculatePeriodReturn } from './calculations.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
})

const router = Router()

router.post('/upload', upload.single('file'), async (req, res) => {
  const user = getAuthUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated.' })

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.', inserted: 0, rejected: [] })
  }

  const { rows, errors } = parseHoldingsCsv(req.file.buffer.toString('utf8'))

  // Flag, don't reject: bad rows are excluded and reported, but every valid
  // row still gets loaded. Only a file with zero valid rows fails outright,
  // since there would be nothing to insert.
  if (rows.length === 0) {
    return res.status(400).json({
      error: errors.length
        ? `Upload rejected: all ${errors.length} row(s) were invalid. No data was saved.`
        : 'CSV contains no valid data rows.',
      inserted: 0,
      rejected: errors,
    })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM holdings WHERE tenant_id = $1', [user.tenantId])
    for (const row of rows) {
      await client.query(
        `INSERT INTO holdings (tenant_id, date, ticker, asset_class, quantity, price)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.tenantId, row.date, row.ticker, row.assetClass, row.quantity, row.price]
      )
    }
    await client.query('COMMIT')
    // The parsed rows are already in memory, so returning them lets the client
    // confirm exactly what landed without a second round-trip.
    res.json({ inserted: rows.length, rejected: errors, rows })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Upload failed:', err)
    res.status(500).json({ error: 'Failed to save holdings.', inserted: 0, rejected: [] })
  } finally {
    client.release()
  }
})

router.get('/summary', async (req, res) => {
  const user = getAuthUser(req)
  if (!user) return res.status(401).json({ error: 'Not authenticated.' })

  const bounds = await pool.query(
    `SELECT MIN(date) AS start_date, MAX(date) AS end_date
     FROM holdings WHERE tenant_id = $1`,
    [user.tenantId]
  )
  const { start_date: startDate, end_date: endDate } = bounds.rows[0]

  if (!startDate) {
    return res.json({ byAssetClass: [], periodReturn: null, startDate: null, endDate: null })
  }

  const byAssetClass = await pool.query(
    `SELECT asset_class, SUM(quantity * price) AS market_value
     FROM holdings
     WHERE tenant_id = $1 AND date = $2
     GROUP BY asset_class
     ORDER BY market_value DESC`,
    [user.tenantId, endDate]
  )

  const totals = await pool.query(
    `SELECT date, SUM(quantity * price) AS total
     FROM holdings
     WHERE tenant_id = $1 AND date IN ($2, $3)
     GROUP BY date`,
    [user.tenantId, startDate, endDate]
  )

  const totalFor = (date) => {
    const match = totals.rows.find(
      (row) => row.date.toISOString().slice(0, 10) === date.toISOString().slice(0, 10)
    )
    return match ? Number(match.total) : 0
  }

  res.json({
    byAssetClass: byAssetClass.rows.map((row) => ({
      assetClass: row.asset_class,
      marketValue: Number(row.market_value),
    })),
    periodReturn: calculatePeriodReturn(totalFor(startDate), totalFor(endDate)),
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
  })
})

export default router
