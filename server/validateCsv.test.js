import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseHoldingsCsv } from './validateCsv.js'

const HEADER = 'date,ticker,asset_class,quantity,price'

test('parses a clean file with no errors', () => {
  const csv = [HEADER, '2026-01-01,AAPL,Equity,100,180.00', '2026-01-01,BND,Bond,200,70.00'].join(
    '\n'
  )
  const { rows, errors } = parseHoldingsCsv(csv)
  assert.equal(rows.length, 2)
  assert.equal(errors.length, 0)
  assert.deepEqual(rows[0], {
    date: '2026-01-01',
    ticker: 'AAPL',
    assetClass: 'Equity',
    quantity: 100,
    price: 180,
  })
})

test('flags a missing field but keeps other valid rows', () => {
  const csv = [HEADER, '2026-01-01,AAPL,Equity,100,180.00', '2026-01-01,,Equity,50,10.00'].join(
    '\n'
  )
  const { rows, errors } = parseHoldingsCsv(csv)
  assert.equal(rows.length, 1)
  assert.equal(errors.length, 1)
  assert.equal(errors[0].row, 3)
  assert.match(errors[0].reason, /Missing required field/)
})

test('flags an invalid date', () => {
  const csv = [HEADER, '2026-13-40,AAPL,Equity,100,180.00'].join('\n')
  const { rows, errors } = parseHoldingsCsv(csv)
  assert.equal(rows.length, 0)
  assert.match(errors[0].reason, /Invalid date/)
})

test('flags a non-numeric or negative quantity/price', () => {
  const csv = [
    HEADER,
    '2026-01-01,AAPL,Equity,abc,180.00',
    '2026-01-01,MSFT,Equity,100,-5.00',
  ].join('\n')
  const { rows, errors } = parseHoldingsCsv(csv)
  assert.equal(rows.length, 0)
  assert.equal(errors.length, 2)
  assert.match(errors[0].reason, /Invalid quantity/)
  assert.match(errors[1].reason, /Invalid price/)
})

test('flags a duplicate ticker+date but keeps the first occurrence and all other valid rows', () => {
  const csv = [
    HEADER,
    '2026-01-01,AAPL,Equity,100,180.00',
    '2026-01-01,MSFT,Equity,50,300.00',
    '2026-01-01,AAPL,Equity,100,180.00',
  ].join('\n')
  const { rows, errors } = parseHoldingsCsv(csv)
  assert.equal(rows.length, 2)
  assert.equal(errors.length, 1)
  assert.equal(errors[0].row, 4)
  assert.match(errors[0].reason, /Duplicate row/)
  assert.match(errors[0].reason, /already appears on row 2/)
})

test('reports the real planted defect in sample_dirty.csv: 18 valid rows, 1 duplicate flagged', async () => {
  const { readFile } = await import('node:fs/promises')
  const csv = await readFile(new URL('../samples/sample_dirty.csv', import.meta.url), 'utf8')
  const { rows, errors } = parseHoldingsCsv(csv)
  assert.equal(rows.length, 18)
  assert.equal(errors.length, 1)
  assert.match(errors[0].reason, /Duplicate row/)
})

test('rejects a file with no data rows', () => {
  const { rows, errors } = parseHoldingsCsv(HEADER)
  assert.equal(rows.length, 0)
  assert.equal(errors.length, 1)
  assert.match(errors[0].reason, /no data rows/)
})

test('rejects a file missing a required column', () => {
  const csv = 'date,ticker,quantity,price\n2026-01-01,AAPL,100,180.00'
  const { rows, errors } = parseHoldingsCsv(csv)
  assert.equal(rows.length, 0)
  assert.match(errors[0].reason, /missing column/)
})
