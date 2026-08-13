import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/about', label: 'About' },
  { to: '/academics', label: 'Academics' },
  { to: '/admissions', label: 'Admissions' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/events', label: 'Events' },
  { to: '/news', label: 'News' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const dashboardPath = user ? `/portal/${user.role}` : '/login'

  return (
    <header className="sticky top-0 z-50 bg-parchment/95 backdrop-blur border-b border-ink/10">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-ink text-parchment flex items-center justify-center shrink-0 stamp text-ink">
              <GraduationCap size={22} strokeWidth={2} />
            </div>
            <div className="leading-tight">
              <div className="font-display font-semibold text-ink text-[1.05rem] tracking-tight">
                Shree Krishna International School
              </div>
              <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink/60">
                Kalwada · Valsad &nbsp;|&nbsp; Code 11654
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-[0.92rem] font-medium transition-colors ${
                    isActive ? 'text-marigold-dark' : 'text-ink/75 hover:text-ink'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => navigate(dashboardPath)}
                  className="text-sm font-semibold px-4 py-2 rounded-full bg-ink text-parchment hover:bg-ink-light transition-colors"
                >
                  {user.name.split(' ')[0]}'s Portal
                </button>
                <button
                  onClick={() => { logout(); navigate('/') }}
                  className="text-sm font-medium text-ink/60 hover:text-ink"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-semibold px-5 py-2.5 rounded-full bg-marigold text-white hover:bg-marigold-dark transition-colors shadow-sm"
              >
                Portal Login
              </button>
            )}
          </div>

          <button className="lg:hidden text-ink" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-ink/10 bg-parchment px-5 py-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block py-2.5 text-[0.95rem] font-medium ${isActive ? 'text-marigold-dark' : 'text-ink/80'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-3 border-t border-ink/10 mt-2 flex flex-col gap-2">
            {user ? (
              <>
                <button
                  onClick={() => { setOpen(false); navigate(dashboardPath) }}
                  className="w-full text-sm font-semibold px-4 py-2.5 rounded-full bg-ink text-parchment"
                >
                  {user.name.split(' ')[0]}'s Portal
                </button>
                <button
                  onClick={() => { setOpen(false); logout(); navigate('/') }}
                  className="w-full text-sm font-medium text-ink/60 py-2"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => { setOpen(false); navigate('/login') }}
                className="w-full text-sm font-semibold px-4 py-2.5 rounded-full bg-marigold text-white"
              >
                Portal Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
