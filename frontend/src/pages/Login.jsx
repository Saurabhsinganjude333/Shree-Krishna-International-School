import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GraduationCap } from 'lucide-react'

const demoAccounts = [
  { role: 'Admin', email: 'admin@skis.edu.in', password: 'Admin@123' },
  { role: 'Teacher', email: 'meera.shah@skis.edu.in', password: 'Teacher@123' },
  { role: 'Parent', email: 'parent@skis.edu.in', password: 'Parent@123' },
  { role: 'Student', email: 'student@skis.edu.in', password: 'Student@123' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      const user = await login(email, password)
      navigate(`/portal/${user.role}`)
    } catch {
      // error shown via context
    }
  }

  const fillDemo = (acc) => { setEmail(acc.email); setPassword(acc.password) }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full bg-ink text-parchment flex items-center justify-center mx-auto mb-4">
          <GraduationCap size={22} />
        </div>
        <h1 className="font-display text-2xl text-ink">Portal Login</h1>
        <p className="text-sm text-ink/55 mt-1">Sign in to your student, parent, teacher or admin portal.</p>
      </div>

      <form onSubmit={submit} className="border border-ink/10 rounded-2xl p-7 bg-white/60 space-y-5">
        <label className="block">
          <span className="block text-sm font-medium text-ink/75 mb-1.5">Email</span>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@skis.edu.in" />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-ink/75 mb-1.5">Password</span>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-marigold hover:bg-marigold-dark disabled:opacity-60 text-white font-semibold text-sm py-3.5 rounded-full transition-colors">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 border border-dashed border-ink/20 rounded-2xl p-5">
        <p className="text-xs font-mono uppercase tracking-wide text-ink/45 mb-3">Try a demo account</p>
        <div className="grid grid-cols-2 gap-2">
          {demoAccounts.map((acc) => (
            <button key={acc.role} onClick={() => fillDemo(acc)} type="button"
              className="text-xs font-medium border border-ink/15 rounded-lg py-2 hover:border-ink/40 text-ink/70">
              {acc.role}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-ink/40 mt-6">
        Looking to enrol your child? <Link to="/admissions" className="text-marigold-dark font-semibold">Apply for admission</Link>
      </p>

      <style>{`
        .input { width: 100%; border: 1px solid rgba(15,42,74,0.15); border-radius: 0.75rem; padding: 0.7rem 0.9rem; font-size: 0.92rem; background: white; color:#1F2937; }
        .input:focus { outline: 2px solid #E8871E; outline-offset: 1px; }
      `}</style>
    </div>
  )
}
