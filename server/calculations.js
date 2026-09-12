export function calculatePeriodReturn(startValue, endValue) {
  if (!startValue) return null
  return (endValue - startValue) / startValue
}
