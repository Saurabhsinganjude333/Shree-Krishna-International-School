import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../../api/client'
import DashboardLayout, { StatCard } from '../../components/DashboardLayout'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'admissions', label: 'Admissions Inbox' },
  { key: 'syllabus', label: 'Syllabus Manager' },
  { key: 'students', label: 'Students' },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [admissions, setAdmissions] = useState([])
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])

  const loadStats = () => api.get('/dashboard/admin').then((r) => setStats(r.data))
  const loadAdmissions = () => api.get('/admissions').then((r) => setAdmissions(r.data))
  const loadClasses = () => api.get('/classes').then((r) => setClasses(r.data))
  const loadStudents = () => api.get('/students').then((r) => setStudents(r.data))

  useEffect(() => { loadStats(); loadAdmissions(); loadClasses(); loadStudents() }, [])

  const setAdmissionStatus = async (id, status) => {
    await api.patch(`/admissions/${id}`, { status })
    loadAdmissions()
  }

  const chartData = classes.map((c) => {
    const allChapters = c.subjects.flatMap((s) => s.chapters)
    const avg = allChapters.length
      ? Math.round(allChapters.reduce((sum, ch) => sum + ch.completion_pct, 0) / allChapters.length)
      : 0
    return { name: c.name, completion: avg }
  })

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Full oversight of SKIS operations" tabs={TABS} activeTab={tab} onTabChange={setTab}>
      {tab === 'overview' && stats && (
        <>
          <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Students" value={stats.total_students} />
            <StatCard label="Total Teachers" value={stats.total_teachers} />
            <StatCard label="Total Classes" value={stats.total_classes} />
            <StatCard label="Pending Admissions" value={stats.pending_admissions} accent="text-marigold-dark" />
            <StatCard label="Avg. Syllabus Completion" value={`${stats.avg_syllabus_completion}%`} accent="text-banyan-dark" />
            <StatCard label="Fee Collected" value={`${stats.fee_collected_pct}%`} accent="text-banyan-dark" />
            <StatCard label="Upcoming Events" value={stats.upcoming_events} />
          </div>

          <div className="border border-ink/10 rounded-2xl p-6 bg-white/50">
            <h3 className="font-display text-lg text-ink mb-5">Syllabus Completion by Grade</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0F2A4A15" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#0F2A4A99' }} />
                <YAxis tick={{ fontSize: 12, fill: '#0F2A4A99' }} unit="%" />
                <Tooltip />
                <Bar dataKey="completion" fill="#E8871E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {tab === 'admissions' && (
        <div className="space-y-3">
          {admissions.map((a) => (
            <div key={a.id} className="border border-ink/10 rounded-2xl p-5 bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-medium text-ink">{a.student_name} <span className="text-ink/40 font-normal">· {a.class_applying}</span></h4>
                <p className="text-sm text-ink/55">Parent: {a.parent_name} · {a.phone} {a.email ? `· ${a.email}` : ''}</p>
                {a.message && <p className="text-xs text-ink/45 mt-1 italic">"{a.message}"</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={a.status}
                  onChange={(e) => setAdmissionStatus(a.id, e.target.value)}
                  className="text-xs font-mono border border-ink/15 rounded-full px-3 py-1.5 bg-white capitalize"
                >
                  {['pending', 'contacted', 'admitted', 'rejected'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          {admissions.length === 0 && <p className="text-ink/40 font-mono text-sm">No admission enquiries yet.</p>}
        </div>
      )}

      {tab === 'syllabus' && <SyllabusManager classes={classes} reload={loadClasses} />}

      {tab === 'students' && (
        <div className="border border-ink/10 rounded-2xl overflow-hidden bg-white/50">
          <table className="w-full text-sm">
            <thead className="bg-ink text-parchment text-left">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Admission No.</th>
                <th className="px-5 py-3 font-medium">Roll No.</th>
                <th className="px-5 py-3 font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-ink/10">
                  <td className="px-5 py-3 text-ink">{s.user.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-ink/60">{s.admission_no}</td>
                  <td className="px-5 py-3 text-ink/60">{s.roll_no}</td>
                  <td className="px-5 py-3 text-ink/60">{s.user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && <p className="text-ink/40 font-mono text-sm p-5">No students enrolled yet.</p>}
        </div>
      )}
    </DashboardLayout>
  )
}

function SyllabusManager({ classes, reload }) {
  const [classId, setClassId] = useState(classes[0]?.id)
  useEffect(() => { if (!classId && classes.length) setClassId(classes[0].id) }, [classes])
  const cls = classes.find((c) => c.id === classId)

  const updateChapter = async (chapterId, patch) => {
    await api.patch(`/chapters/${chapterId}`, patch)
    reload()
  }

  return (
    <div>
      <select value={classId || ''} onChange={(e) => setClassId(Number(e.target.value))} className="mb-6 font-mono text-xs border border-ink/15 rounded-full px-3 py-1.5 bg-white text-ink/80">
        {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
      </select>

      {cls && (
        <div className="grid md:grid-cols-2 gap-6">
          {cls.subjects.map((s) => (
            <div key={s.id} className="border border-ink/10 rounded-2xl p-6 bg-white/50">
              <h3 className="font-display text-lg text-ink mb-4">{s.name}</h3>
              <div className="space-y-2">
                {s.chapters.map((ch) => (
                  <div key={ch.id} className="flex items-center gap-3 py-1.5 ledger-row">
                    <span className="text-sm text-ink/80 flex-1">{ch.title}</span>
                    <select
                      value={ch.status}
                      onChange={(e) => updateChapter(ch.id, { status: e.target.value })}
                      className="text-xs font-mono border border-ink/15 rounded-full px-2.5 py-1 bg-white"
                    >
                      <option value="not_started">Not started</option>
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    {ch.status === 'in_progress' && (
                      <input
                        type="number" min={0} max={99} value={ch.completion_pct}
                        onChange={(e) => updateChapter(ch.id, { completion_pct: Number(e.target.value) })}
                        className="w-14 text-xs font-mono border border-ink/15 rounded-full px-2 py-1 bg-white"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
