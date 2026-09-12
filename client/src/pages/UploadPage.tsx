import { useEffect, useState } from 'react'
import { ArrowRight, FileSpreadsheet, Sparkles, Table2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import CsvUploader from '../components/CsvUploader'
import { fetchSummary, getStoredUser, type HoldingRow } from '../api'

const expectedColumns = [
  { name: 'date', description: 'Holding date, formatted YYYY-MM-DD' },
  { name: 'ticker', description: 'Instrument symbol, e.g. AAPL' },
  { name: 'asset_class', description: 'Equity, Bond, Cash, ...' },
  { name: 'quantity', description: 'Units held, a non-negative number' },
  { name: 'price', description: 'Price per unit, a non-negative number' },
]

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default function UploadPage() {
  const [uploaded, setUploaded] = useState(false)
  const [isFirstUpload, setIsFirstUpload] = useState(false)
  const [loadedRows, setLoadedRows] = useState<HoldingRow[]>([])
  const user = getStoredUser()

  useEffect(() => {
    fetchSummary()
      .then((summary) => setIsFirstUpload(summary.byAssetClass.length === 0))
      .catch(() => setIsFirstUpload(false))
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-teal-400">
          Holdings
        </p>
        <h1 className="font-serif text-2xl text-slate-50 sm:text-3xl">Upload</h1>
        <p className="mt-2 text-sm text-slate-400">
          Upload a CSV of holdings for your tenant. A new upload replaces the previous
          one. Rows with a missing field, bad date, or duplicate ticker/date are
          flagged and skipped — everything else still loads.
        </p>
      </header>

      {isFirstUpload && !uploaded && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-teal-800/50 bg-teal-950/30 p-5">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-teal-400" />
          <div>
            <p className="font-medium text-slate-100">
              Welcome{user ? `, ${user.tenantName}` : ''} — let's get your portfolio in.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              There are no holdings on this account yet. Upload a CSV below and your
              dashboard will be ready straight after.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <CsvUploader
          onUploadComplete={(data) => {
            setUploaded(true)
            setIsFirstUpload(false)
            setLoadedRows(data.rows ?? [])
          }}
        />
      </div>

      {uploaded && (
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
        >
          View dashboard
          <ArrowRight size={16} />
        </Link>
      )}

      {loadedRows.length > 0 && (
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-5 flex items-center gap-3">
            <Table2 size={17} className="text-slate-500" />
            <h2 className="font-mono text-xs uppercase tracking-widest text-slate-400">
              Holdings Loaded ({loadedRows.length})
            </h2>
          </div>

          <div className="max-h-96 overflow-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-900">
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="px-3 py-2 font-normal">Date</th>
                  <th className="px-3 py-2 font-normal">Ticker</th>
                  <th className="px-3 py-2 font-normal">Asset class</th>
                  <th className="px-3 py-2 text-right font-normal">Quantity</th>
                  <th className="px-3 py-2 text-right font-normal">Price</th>
                  <th className="px-3 py-2 text-right font-normal">Market value</th>
                </tr>
              </thead>
              <tbody>
                {loadedRows.map((row) => (
                  <tr
                    key={`${row.date}-${row.ticker}`}
                    className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30"
                  >
                    <td className="px-3 py-2 font-mono text-xs text-slate-400">{row.date}</td>
                    <td className="px-3 py-2 font-medium text-slate-200">{row.ticker}</td>
                    <td className="px-3 py-2 text-slate-400">{row.assetClass}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs text-slate-300">
                      {row.quantity.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs text-slate-300">
                      {formatCurrency(row.price)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs text-slate-200">
                      {formatCurrency(row.quantity * row.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="mb-5 flex items-center gap-3">
          <FileSpreadsheet size={17} className="text-slate-500" />
          <h2 className="font-mono text-xs uppercase tracking-widest text-slate-400">
            Expected Format
          </h2>
        </div>

        <dl className="divide-y divide-slate-800 border-y border-slate-800">
          {expectedColumns.map(({ name, description }) => (
            <div
              key={name}
              className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <dt className="font-mono text-xs text-teal-300 sm:w-32">{name}</dt>
              <dd className="text-sm text-slate-400">{description}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
          Example
        </p>
        <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-400">
          date,ticker,asset_class,quantity,price{'\n'}
          2026-01-01,AAPL,Equity,100,180.00
        </pre>
      </section>
    </div>
  )
}
