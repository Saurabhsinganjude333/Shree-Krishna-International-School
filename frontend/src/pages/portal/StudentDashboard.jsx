import { useEffect, useState } from 'react'
import api from '../../api/client'
import DashboardLayout from '../../components/DashboardLayout'
import StudentPortalView from '../../components/StudentPortalView'

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null)

  useEffect(() => { api.get('/students/me/profile').then((r) => setProfile(r.data)) }, [])

  return (
    <DashboardLayout
      title={profile ? `Welcome, ${profile.user.name.split(' ')[0]}` : 'Welcome'}
      subtitle={profile ? `Admission No. ${profile.admission_no} · Roll No. ${profile.roll_no}` : ''}
    >
      {profile ? <StudentPortalView studentId={profile.id} /> : (
        <p className="text-ink/40 font-mono text-sm">Loading your profile…</p>
      )}
    </DashboardLayout>
  )
}
