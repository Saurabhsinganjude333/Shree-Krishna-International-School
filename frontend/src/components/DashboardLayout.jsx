import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'

export default function DashboardLayout({ title, subtitle, tabs, activeTab, onTabChange, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-marigold-dark mb-1 capitalize">{user?.role} Portal</div>
          <h1 className="font-display text-3xl text-ink">{title}</h1>
          {subtitle && <p className="text-sm text-ink/55 mt-1">{subtitle}</p>}
        </div>
        <button
          onClick={() => { logout(); navigate('/') }}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-ink border border-ink/15 rounded-full px-4 py-2 self-start"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>

      {tabs && (
        <div className="flex flex-wrap gap-2 mb-8 border-b border-ink/10 pb-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === t.key ? 'bg-ink text-parchment' : 'text-ink/60 hover:bg-ink/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {children}
    </div>
  )
}

export function StatCard({ label, value, accent = 'text-ink' }) {
  return (
    <div className="border border-ink/10 rounded-2xl p-5 bg-white/60">
      <div className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-ink/45 mb-2">{label}</div>
      <div className={`font-display text-3xl ${accent}`}>{value}</div>
    </div>
  )
}
