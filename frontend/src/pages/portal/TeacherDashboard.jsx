import { useEffect, useState } from 'react'
import api from '../../api/client'
import DashboardLayout from '../../components/DashboardLayout'
import { ChapterRow } from '../../components/SyllabusLedger'

const TABS = [
  { key: 'syllabus', label: 'Update Syllabus' },
  { key: 'attendance', label: 'Mark Attendance' },
  { key: 'results', label: 'Enter Results' },
]

export default function TeacherDashboard() {
  const [tab, setTab] = useState('syllabus')
  const [classes, setClasses] = useState([])

  const loadClasses = () => api.get('/classes').then((r) => setClasses(r.data))
  useEffect(() => { loadClasses() }, [])

  return (
    <DashboardLayout title="Teacher Dashboard" subtitle="Keep syllabus, attendance and results up to date" tabs={TABS} activeTab={tab} onTabChange={setTab}>
      {tab === 'syllabus' && <SyllabusTab classes={classes} reload={loadClasses} />}
      {tab === 'attendance' && <AttendanceTab classes={classes} />}
      {tab === 'results' && <ResultsTab classes={classes} />}
    </DashboardLayout>
  )
}

function SyllabusTab({ classes, reload }) {
  const [classId, setClassId] = useState(null)
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

function AttendanceTab({ classes }) {
  const [classId, setClassId] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [students, setStudents] = useState([])
  const [marks, setMarks] = useState({})
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (!classId && classes.length) setClassId(classes[0].id) }, [classes])
  useEffect(() => {
    if (!classId) return
    api.get('/students', { params: { class_id: classId } }).then((r) => {
      setStudents(r.data)
      setMarks(Object.fromEntries(r.data.map((s) => [s.id, 'present'])))
    })
  }, [classId])

  const submit = async () => {
    await api.post('/attendance/bulk', {
      class_id: classId,
      date,
      entries: students.map((s) => ({ student_id: s.id, status: marks[s.id] })),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-2xl">
      <div className="flex gap-3 mb-6">
        <select value={classId || ''} onChange={(e) => setClassId(Number(e.target.value))} className="font-mono text-xs border border-ink/15 rounded-full px-3 py-1.5 bg-white text-ink/80">
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="font-mono text-xs border border-ink/15 rounded-full px-3 py-1.5 bg-white text-ink/80" />
      </div>

      <div className="border border-ink/10 rounded-2xl divide-y divide-ink/10 bg-white/50">
        {students.map((s) => (
          <div key={s.id} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-ink">{s.user.name} <span className="text-ink/40 font-mono text-xs">#{s.roll_no}</span></span>
            <div className="flex gap-1.5">
              {['present', 'absent', 'late', 'leave'].map((st) => (
                <button
                  key={st}
                  onClick={() => setMarks({ ...marks, [s.id]: st })}
                  className={`text-xs font-medium px-3 py-1 rounded-full capitalize border transition-colors ${
                    marks[s.id] === st ? 'bg-ink text-parchment border-ink' : 'border-ink/15 text-ink/50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        ))}
        {students.length === 0 && <p className="text-ink/40 font-mono text-sm p-5">No students in this class yet.</p>}
      </div>

      {students.length > 0 && (
        <button onClick={submit} className="mt-5 bg-marigold hover:bg-marigold-dark text-white font-semibold text-sm px-6 py-3 rounded-full transition-colors">
          {saved ? 'Saved ✓' : 'Save Attendance'}
        </button>
      )}
    </div>
  )
}

function ResultsTab({ classes }) {
  const [classId, setClassId] = useState(null)
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({ student_id: '', subject_id: '', exam_name: '', marks_obtained: '', max_marks: 100 })
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (!classId && classes.length) setClassId(classes[0].id) }, [classes])
  useEffect(() => {
    if (!classId) return
    api.get('/students', { params: { class_id: classId } }).then((r) => setStudents(r.data))
  }, [classId])

  const cls = classes.find((c) => c.id === classId)

  const submit = async (e) => {
    e.preventDefault()
    await api.post('/results', {
      ...form,
      marks_obtained: Number(form.marks_obtained),
      max_marks: Number(form.max_marks),
    })
    setSaved(true)
    setForm({ ...form, marks_obtained: '', exam_name: '' })
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-lg">
      <select value={classId || ''} onChange={(e) => { setClassId(Number(e.target.value)); setForm({ ...form, student_id: '', subject_id: '' }) }} className="mb-6 font-mono text-xs border border-ink/15 rounded-full px-3 py-1.5 bg-white text-ink/80">
        {classes.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
      </select>

      <form onSubmit={submit} className="border border-ink/10 rounded-2xl p-6 bg-white/50 space-y-4">
        <select required value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} className="input">
          <option value="">Select student</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.user.name} (#{s.roll_no})</option>)}
        </select>
        <select required value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="input">
          <option value="">Select subject</option>
          {cls?.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input required placeholder="Exam name (e.g. Unit Test 2)" value={form.exam_name} onChange={(e) => setForm({ ...form, exam_name: e.target.value })} className="input" />
        <div className="grid grid-cols-2 gap-3">
          <input required type="number" placeholder="Marks obtained" value={form.marks_obtained} onChange={(e) => setForm({ ...form, marks_obtained: e.target.value })} className="input" />
          <input required type="number" placeholder="Max marks" value={form.max_marks} onChange={(e) => setForm({ ...form, max_marks: e.target.value })} className="input" />
        </div>
        <button type="submit" className="w-full bg-marigold hover:bg-marigold-dark text-white font-semibold text-sm py-3 rounded-full transition-colors">
          {saved ? 'Saved ✓' : 'Add Result'}
        </button>
      </form>
      <style>{`
        .input { width: 100%; border: 1px solid rgba(15,42,74,0.15); border-radius: 0.75rem; padding: 0.65rem 0.9rem; font-size: 0.88rem; background: white; color:#1F2937; }
        .input:focus { outline: 2px solid #E8871E; outline-offset: 1px; }
      `}</style>
    </div>
  )
}
