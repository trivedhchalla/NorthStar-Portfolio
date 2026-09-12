import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, Layers, Wallet } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Navigate } from 'react-router-dom'
import { fetchSummary, type SummaryData } from '../api'

const BAR_COLORS = ['#2dd4bf', '#34d399', '#60a5fa', '#a78bfa', '#f472b6']

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // undefined = "no filter applied yet" (defaults to everything); reset
  // whenever a new upload changes the set of asset classes available.
  const [selectedClasses, setSelectedClasses] = useState<Set<string> | undefined>(undefined)

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchSummary()
      setSummary(data)
      setSelectedClasses(new Set(data.byAssetClass.map((row) => row.assetClass)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load portfolio data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  const allClasses = summary?.byAssetClass.map((row) => row.assetClass) ?? []
  const activeClasses = selectedClasses ?? new Set(allClasses)
  const filteredRows = summary?.byAssetClass.filter((row) => activeClasses.has(row.assetClass)) ?? []
  const totalValue = filteredRows.reduce((sum, row) => sum + row.marketValue, 0)
  const isFiltered = activeClasses.size < allClasses.length
  const hasData = Boolean(summary && summary.byAssetClass.length > 0)

  function toggleClass(assetClass: string) {
    setSelectedClasses((prev) => {
      const next = new Set(prev ?? allClasses)
      if (next.has(assetClass)) {
        next.delete(assetClass)
      } else {
        next.add(assetClass)
      }
      return next
    })
  }

  // Nothing uploaded yet: the dashboard has nothing to render, so send the
  // user to the one action that will change that.
  if (!loading && !error && summary && !hasData) {
    return <Navigate to="/upload" replace />
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-teal-400">
            Portfolio Overview
          </p>
          <h1 className="font-serif text-2xl text-slate-50 sm:text-3xl">Dashboard</h1>
        </div>
        {hasData && summary && (
          <span className="rounded-full border border-slate-800 bg-slate-900/60 px-4 py-1.5 font-mono text-xs text-slate-400">
            {summary.startDate} &rarr; {summary.endDate}
          </span>
        )}
      </header>

      {error && (
        <p className="mb-6 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-teal-400" />
          Loading portfolio...
        </div>
      ) : (
        <>
          {hasData && summary && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    {isFiltered ? 'Filtered Market Value' : 'Total Market Value'}
                  </p>
                  <Wallet size={15} className="text-slate-600" />
                </div>
                <p className="font-serif text-3xl text-slate-50">
                  {formatCurrency(totalValue)}
                </p>
                <p className="mt-1 text-xs text-slate-500">As of {summary.endDate}</p>
              </article>

              <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    Period Return
                  </p>
                  <ArrowUpRight size={15} className="text-slate-600" />
                </div>
                <p
                  className={`font-serif text-3xl ${
                    (summary.periodReturn ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {summary.periodReturn === null
                    ? 'N/A'
                    : `${summary.periodReturn >= 0 ? '+' : ''}${(
                        summary.periodReturn * 100
                      ).toFixed(2)}%`}
                </p>
                <p className="mt-1 text-xs text-slate-500">Start vs. end market value</p>
              </article>

              <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    Asset Classes
                  </p>
                  <Layers size={15} className="text-slate-600" />
                </div>
                <p className="font-serif text-3xl text-slate-50">
                  {summary.byAssetClass.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">Represented in holdings</p>
              </article>
            </div>
          )}

          {hasData && summary ? (
            <>
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="mr-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Filter
                </span>
                {allClasses.map((assetClass) => {
                  const active = activeClasses.has(assetClass)
                  return (
                    <button
                      key={assetClass}
                      type="button"
                      onClick={() => toggleClass(assetClass)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        active
                          ? 'border-teal-700 bg-teal-500/15 text-teal-300'
                          : 'border-slate-800 bg-transparent text-slate-500 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      {assetClass}
                    </button>
                  )
                })}
                {isFiltered && (
                  <button
                    type="button"
                    onClick={() => setSelectedClasses(new Set(allClasses))}
                    className="text-xs text-slate-500 underline decoration-slate-700 underline-offset-2 hover:text-slate-300"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <section className="min-w-0 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-3">
                <h2 className="mb-5 font-mono text-xs uppercase tracking-widest text-slate-400">
                  Market Value by Asset Class
                </h2>
                {filteredRows.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No asset classes selected.
                  </p>
                ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500">
                      <th className="pb-3 font-normal">Asset class</th>
                      <th className="pb-3 text-right font-normal">Allocation</th>
                      <th className="pb-3 text-right font-normal">Market value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => {
                      const share = totalValue ? row.marketValue / totalValue : 0
                      return (
                        <tr
                          key={row.assetClass}
                          className="border-b border-slate-800/60 transition hover:bg-slate-800/30"
                        >
                          <td className="py-3 text-slate-200">{row.assetClass}</td>
                          <td className="py-3">
                            <div className="flex items-center justify-end gap-2">
                              <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-slate-800 sm:block">
                                <span
                                  className="block h-full rounded-full bg-teal-400"
                                  style={{ width: `${share * 100}%` }}
                                />
                              </span>
                              <span className="w-12 text-right font-mono text-xs text-slate-400">
                                {(share * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-right font-mono text-slate-200">
                            {formatCurrency(row.marketValue)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="pt-3 font-medium text-slate-300">Total</td>
                      <td />
                      <td className="pt-3 text-right font-mono font-medium text-slate-50">
                        {formatCurrency(totalValue)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                )}
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-2">
                <h2 className="mb-5 font-mono text-xs uppercase tracking-widest text-slate-400">
                  Allocation Chart
                </h2>
                {filteredRows.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No asset classes selected.
                  </p>
                ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={filteredRows}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="assetClass"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      axisLine={{ stroke: '#1e293b' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      cursor={{ fill: '#1e293b60' }}
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: 8,
                        color: '#e2e8f0',
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Market value']}
                    />
                    <Bar dataKey="marketValue" radius={[6, 6, 0, 0]}>
                      {filteredRows.map((row, index) => (
                        <Cell key={row.assetClass} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                )}
              </section>
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  )
}
