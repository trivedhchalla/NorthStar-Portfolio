import { parse } from 'csv-parse/sync'

const REQUIRED_COLUMNS = ['date', 'ticker', 'asset_class', 'quantity', 'price']

function checkMissingFields(record) {
  const missing = REQUIRED_COLUMNS.filter(
    (column) => String(record[column] ?? '').trim() === ''
  )
  return missing.length ? `Missing required field(s): ${missing.join(', ')}` : null
}

function checkDate(record) {
  const value = String(record.date).trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `Invalid date "${value}" (expected YYYY-MM-DD)`
  }
  const parsed = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || !parsed.toISOString().startsWith(value)) {
    return `Invalid date "${value}" (not a real calendar date)`
  }
  return null
}

function checkNumbers(record) {
  for (const column of ['quantity', 'price']) {
    const value = Number(record[column])
    if (!Number.isFinite(value)) {
      return `Invalid ${column} "${record[column]}" (expected a number)`
    }
    if (value < 0) {
      return `Invalid ${column} "${record[column]}" (must not be negative)`
    }
  }
  return null
}

const rowChecks = [checkMissingFields, checkDate, checkNumbers]

export function parseHoldingsCsv(text) {
  let records
  try {
    records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    })
  } catch (err) {
    return { rows: [], errors: [{ row: 0, reason: `Could not parse CSV: ${err.message}` }] }
  }

  if (records.length === 0) {
    return { rows: [], errors: [{ row: 0, reason: 'CSV contains no data rows.' }] }
  }

  const missingColumns = REQUIRED_COLUMNS.filter((column) => !(column in records[0]))
  if (missingColumns.length) {
    return {
      rows: [],
      errors: [{ row: 1, reason: `CSV is missing column(s): ${missingColumns.join(', ')}` }],
    }
  }

  const rows = []
  const errors = []
  const seen = new Map()

  records.forEach((record, index) => {
    const rowNumber = index + 2

    const failure = rowChecks.reduce((found, check) => found ?? check(record), null)
    if (failure) {
      errors.push({ row: rowNumber, reason: failure })
      return
    }

    const ticker = String(record.ticker).trim().toUpperCase()
    const key = `${record.date}|${ticker}`
    if (seen.has(key)) {
      errors.push({
        row: rowNumber,
        reason: `Duplicate row: ${ticker} on ${record.date} already appears on row ${seen.get(key)}`,
      })
      return
    }
    seen.set(key, rowNumber)

    rows.push({
      date: String(record.date).trim(),
      ticker,
      assetClass: String(record.asset_class).trim(),
      quantity: Number(record.quantity),
      price: Number(record.price),
    })
  })

  return { rows, errors }
}
