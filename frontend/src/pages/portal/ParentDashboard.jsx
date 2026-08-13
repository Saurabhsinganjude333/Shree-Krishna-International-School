import { useEffect, useState } from 'react'
import api from '../../api/client'
import DashboardLayout from '../../components/DashboardLayout'
import StudentPortalView from '../../components/StudentPortalView'

export default function ParentDashboard() {
  const [children, setChildren] = useState([])
  const [activeChild, setActiveChild] = useState(null)

  useEffect(() => {
    api.get('/parents/me/children').then((r) => {
      setChildren(r.data)
      if (r.data.length) setActiveChild(r.data[0].id)
    })
  }, [])

  const child = children.find((c) => c.id === activeChild)

  return (
    <DashboardLayout
      title="Parent Dashboard"
      subtitle={child ? `Viewing progress for ${child.user.name}` : 'Track your child\'s progress'}
    >
      {children.length > 1 && (
        <div className="flex gap-2 mb-8">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChild(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                activeChild === c.id ? 'bg-ink text-parchment border-ink' : 'border-ink/15 text-ink/60'
              }`}
            >
              {c.user.name}
            </button>
          ))}
        </div>
      )}

      {child ? <StudentPortalView studentId={child.id} /> : (
        <p className="text-ink/40 font-mono text-sm">No linked student profile found for your account yet. Please contact the school office.</p>
      )}
    </DashboardLayout>
  )
}
