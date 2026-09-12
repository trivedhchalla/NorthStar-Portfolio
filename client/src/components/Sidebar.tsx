import { LayoutDashboard, LogOut, Menu, TrendingUp, Upload, User, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { clearSession, getStoredUser } from '../api'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/profile', label: 'Profile', icon: User },
]

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onClose: () => void
}

export default function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate()
  const user = getStoredUser()
  const initials = (user?.tenantName ?? '')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  function handleLogout() {
    clearSession()
    onClose()
    navigate('/login')
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col overflow-hidden whitespace-nowrap border-r border-slate-800 bg-slate-900 transition-all duration-200 lg:static lg:z-auto lg:translate-x-0 lg:bg-slate-900/40 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
    >
      <div
        className={`flex border-b border-slate-800 px-4 py-5 ${
          collapsed ? 'lg:flex-col lg:items-center lg:gap-4' : ''
        } items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-slate-950">
            <TrendingUp size={18} strokeWidth={2.5} />
          </span>
          <div className={`leading-tight ${collapsed ? 'lg:hidden' : ''}`}>
            <p className="font-serif text-base text-slate-50">Northstar</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-teal-400">
              Portfolio
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800/60 hover:text-slate-200 lg:hidden"
        >
          <X size={18} />
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
          className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-slate-800/60 hover:text-slate-200 lg:block"
        >
          <Menu size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                collapsed ? 'lg:justify-center lg:px-0' : ''
              } ${
                isActive
                  ? 'bg-teal-500/10 font-medium text-teal-300'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`
            }
          >
            <Icon size={17} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <div
          className={`mb-2 flex items-center gap-3 rounded-lg px-3 py-2 ${
            collapsed ? 'lg:justify-center lg:px-0' : ''
          }`}
        >
          <span
            title={collapsed ? user?.tenantName : undefined}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 font-mono text-xs text-teal-300"
          >
            {initials || '--'}
          </span>
          <div className={`min-w-0 leading-tight ${collapsed ? 'lg:hidden' : ''}`}>
            <p className="truncate text-sm text-slate-200">{user?.tenantName}</p>
            <p className="truncate font-mono text-[10px] text-slate-500">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title={collapsed ? 'Log out' : undefined}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-300 ${
            collapsed ? 'lg:justify-center lg:px-0' : ''
          }`}
        >
          <LogOut size={17} className="shrink-0" />
          <span className={collapsed ? 'lg:hidden' : ''}>Log out</span>
        </button>
      </div>
    </aside>
  )
}
