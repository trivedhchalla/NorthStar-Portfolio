const sampleData = [
  { assetClass: 'Equity', marketValue: 129000 },
  { assetClass: 'Bond', marketValue: 45000 },
  { assetClass: 'Cash', marketValue: 5000 },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 px-8 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 text-teal-400">
            &#9650;
          </span>
          <span className="font-serif text-lg text-slate-50">Northstar Portfolio</span>
        </div>
        <button className="rounded-full border border-slate-700 px-4 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-slate-100">
          Log out
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-8">
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-slate-400">
            Upload holdings CSV
          </h2>
          <div className="flex items-center gap-3">
            <input type="file" accept=".csv" className="text-sm text-slate-300" />
            <button className="rounded-full bg-teal-500 px-4 py-1.5 text-sm font-semibold text-slate-950 hover:bg-teal-400">
              Upload
            </button>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-1 font-mono text-xs uppercase tracking-widest text-slate-400">
            Period Return
          </h2>
          <p className="font-serif text-3xl text-emerald-400">+4.2%</p>
          <p className="mt-1 text-sm text-slate-500">Jan 1 &ndash; Jun 30, 2026</p>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-slate-400">
              Market Value by Asset Class
            </h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-2 font-normal">Asset class</th>
                  <th className="pb-2 text-right font-normal">Market value</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row) => (
                  <tr key={row.assetClass} className="border-b border-slate-800/60">
                    <td className="py-2 text-slate-200">{row.assetClass}</td>
                    <td className="py-2 text-right text-slate-200">
                      ${row.marketValue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-slate-400">
              Chart
            </h2>
            <p className="text-sm text-slate-600">Chart goes here</p>
          </section>
        </div>
      </main>
    </div>
  )
}
