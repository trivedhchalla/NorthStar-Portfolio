import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calculatePeriodReturn } from './calculations.js'

test('calculatePeriodReturn: gain', () => {
  assert.equal(calculatePeriodReturn(100, 110), 0.1)
})

test('calculatePeriodReturn: loss', () => {
  assert.equal(calculatePeriodReturn(100, 90), -0.1)
})

test('calculatePeriodReturn: no change', () => {
  assert.equal(calculatePeriodReturn(100, 100), 0)
})

test('calculatePeriodReturn: zero start value returns null instead of dividing by zero', () => {
  assert.equal(calculatePeriodReturn(0, 100), null)
})

test('calculatePeriodReturn: matches the brief\'s worked example', () => {
  // period_return = (end - start) / start
  assert.equal(calculatePeriodReturn(92600, 96400), (96400 - 92600) / 92600)
})
