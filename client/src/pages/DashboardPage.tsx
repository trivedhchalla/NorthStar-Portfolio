import { useState } from 'react'
import { ArrowUpRight, Layers, PieChart, Wallet } from 'lucide-react'
import CsvUploader from '../components/CsvUploader'

interface SummaryData {
  byAssetClass: Array<{ assetClass: string; marketValue: number }>
  periodReturn: number
  startDate: string
  endDate: string
}

const sampleData: SummaryData = {
  byAssetClass: [
    { assetClass: 'Equity', marketValue: 129000 },
    { assetClass: 'Bond', marketValue: 45000 },
    { assetClass: 'Cash', marketValue: 5000 },
  ],
  periodReturn: 0.042,
  startDate: '2026-01-01',
  endDate: '2026-06-30',
}

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(sampleData)

  function handleUploadComplete() {
    setSummary(sampleData)
  }

  const totalValue =
    summary?.byAssetClass.reduce((sum, row) => sum + row.marketValue, 0) ?? 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-teal-400">
            Portfolio Overview
          </p>
          <h1 className="font-serif text-2xl text-slate-50 sm:text-3xl">Dashboard</h1>
        </div>
        {summary && (
          <span className="rounded-full border border-slate-800 bg-slate-900/60 px-4 py-1.5 font-mono text-xs text-slate-400">
            {summary.startDate} &rarr; {summary.endDate}
          </span>
        )}
      </header>

      {summary ? (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Total Market Value
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
                  summary.periodReturn >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {summary.periodReturn >= 0 ? '+' : ''}
                {(summary.periodReturn * 100).toFixed(2)}%
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

          <div className="mb-6">
            <CsvUploader onUploadComplete={handleUploadComplete} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <section className="min-w-0 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-3">
              <h2 className="mb-5 font-mono text-xs uppercase tracking-widest text-slate-400">
                Market Value by Asset Class
              </h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="pb-3 font-normal">Asset class</th>
                    <th className="pb-3 text-right font-normal">Allocation</th>
                    <th className="pb-3 text-right font-normal">Market value</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.byAssetClass.map((row) => {
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
            </section>

            <section className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-2">
              <h2 className="mb-5 font-mono text-xs uppercase tracking-widest text-slate-400">
                Allocation Chart
              </h2>
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-600">
                <PieChart size={32} strokeWidth={1.5} />
                <p className="text-sm">Chart goes here</p>
              </div>
            </section>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6">
            <CsvUploader onUploadComplete={handleUploadComplete} />
          </div>
          <section className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-16 text-center">
            <Layers size={28} strokeWidth={1.5} className="mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400">No holdings yet</p>
            <p className="mt-1 text-sm text-slate-600">
              Upload a CSV to see your portfolio breakdown.
            </p>
          </section>
        </>
      )}
    </div>
  )
}
