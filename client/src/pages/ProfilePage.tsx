import { Building2, Mail, ShieldCheck } from 'lucide-react'

const details = [
  { icon: Mail, label: 'Email', value: 'tenant_a@example.com' },
  { icon: Building2, label: 'Tenant', value: 'Alpha Capital' },
  { icon: ShieldCheck, label: 'Access', value: 'Own tenant data only' },
]

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-teal-400">
          Account
        </p>
        <h1 className="font-serif text-2xl text-slate-50 sm:text-3xl">Profile</h1>
      </header>

      <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
        <div className="mb-8 flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 font-serif text-2xl text-slate-950">
            AC
          </span>
          <div>
            <p className="font-serif text-xl text-slate-50">Alpha Capital</p>
            <p className="text-sm text-slate-400">Tenant 1</p>
          </div>
        </div>

        <dl className="divide-y divide-slate-800 border-t border-slate-800">
          {details.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex items-center gap-4">
                <Icon size={17} className="shrink-0 text-slate-500" />
                <dt className="font-mono text-xs uppercase tracking-widest text-slate-500 sm:w-32">
                  {label}
                </dt>
              </div>
              <dd className="ml-9 break-all text-sm text-slate-200 sm:ml-0">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="text-sm text-slate-500">
        Profile details are read-only. Every request is scoped to this tenant on the
        server, so no other tenant's holdings are reachable from this account.
      </p>
    </div>
  )
}
