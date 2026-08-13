import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import api from '../api/client'
import { SubjectLedgerCard } from './SyllabusLedger'
import { StatCard } from './DashboardLayout'

const ATT_COLORS = { present: '#1B7A4D', absent: '#dc2626', late: '#E8871E', leave: '#0F2A4A55' }

export default function StudentPortalView({ studentId }) {
  const [syllabus, setSyllabus] = useState([])
  const [attSummary, setAttSummary] = useState(null)
  const [results, setResults] = useState([])
  const [fees, setFees] = useState([])

  useEffect(() => {
    if (!studentId) return
    api.get(`/syllabus/student/${studentId}`).then((r) => setSyllabus(r.data)).catch(() => {})
    api.get(`/attendance/student/${studentId}/summary`).then((r) => setAttSummary(r.data)).catch(() => {})
    api.get(`/results/student/${studentId}`).then((r) => setResults(r.data)).catch(() => {})
    api.get(`/fees/student/${studentId}`).then((r) => setFees(r.data)).catch(() => {})
  }, [studentId])

  const overallSyllabus = syllabus.length
    ? Math.round(syllabus.reduce((s, x) => s + x.avg_completion_pct, 0) / syllabus.length)
    : 0

  const attPie = attSummary
    ? [
        { name: 'Present', value: attSummary.present, color: ATT_COLORS.present },
        { name: 'Absent', value: attSummary.absent, color: ATT_COLORS.absent },
        { name: 'Late', value: attSummary.late, color: ATT_COLORS.late },
        { name: 'Leave', value: attSummary.leave, color: ATT_COLORS.leave },
      ].filter((d) => d.value > 0)
    : []

  return (
    <div className="space-y-10">
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Syllabus Progress" value={`${overallSyllabus}%`} accent="text-marigold-dark" />
        <StatCard label="Attendance" value={attSummary ? `${attSummary.percentage}%` : '—'} accent="text-banyan-dark" />
        <StatCard label="Results Logged" value={results.length} />
      </div>

      <div>
        <h3 className="font-display text-xl text-ink mb-4">Syllabus Progress — Live</h3>
        <div className="border border-ink/10 rounded-2xl p-6 bg-white/50">
          {syllabus.map((s) => (
            <div key={s.subject_id} className="py-3 ledger-row flex items-center gap-3">
              <span className="text-sm text-ink/85 flex-1">{s.subject_name}</span>
              <span className="text-xs font-mono text-ink/45">{s.completed_chapters}/{s.total_chapters} chapters</span>
              <div className="w-32 h-2 rounded-full bg-ink/10 overflow-hidden">
                <div className="h-full bg-marigold rounded-full" style={{ width: `${s.avg_completion_pct}%` }} />
              </div>
              <span className="font-mono text-xs text-ink w-10 text-right">{s.avg_completion_pct}%</span>
            </div>
          ))}
          {syllabus.length === 0 && <p className="text-ink/40 font-mono text-sm">No syllabus data yet.</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-ink/10 rounded-2xl p-6 bg-white/50">
          <h3 className="font-display text-lg text-ink mb-4">Attendance</h3>
          {attSummary && attSummary.total_days > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={attPie} dataKey="value" innerRadius={40} outerRadius={65} paddingAngle={2}>
                    {attPie.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 text-sm">
                {attPie.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-ink/70">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-ink/40 font-mono text-sm">No attendance recorded yet.</p>}
        </div>

        <div className="border border-ink/10 rounded-2xl p-6 bg-white/50">
          <h3 className="font-display text-lg text-ink mb-4">Recent Results</h3>
          <div className="space-y-2.5">
            {results.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm ledger-row py-2">
                <span className="text-ink/75">{r.exam_name}</span>
                <span className="font-mono text-xs text-ink">{r.marks_obtained}/{r.max_marks} <span className="text-marigold-dark ml-1">{r.grade}</span></span>
              </div>
            ))}
            {results.length === 0 && <p className="text-ink/40 font-mono text-sm">No results recorded yet.</p>}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg text-ink mb-4">Fee Status</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {fees.map((f) => (
            <div key={f.id} className="border border-ink/10 rounded-2xl p-5 bg-white/50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-ink text-sm">{f.term}</span>
                <span className={`text-xs font-mono px-2.5 py-1 rounded-full capitalize ${
                  f.status === 'paid' ? 'bg-banyan/10 text-banyan-dark' : f.status === 'partial' ? 'bg-marigold/10 text-marigold-dark' : 'bg-red-100 text-red-700'
                }`}>{f.status}</span>
              </div>
              <p className="text-xs text-ink/55">₹{f.amount_paid.toLocaleString('en-IN')} paid of ₹{f.amount_due.toLocaleString('en-IN')}</p>
              <div className="w-full h-1.5 rounded-full bg-ink/10 mt-2 overflow-hidden">
                <div className="h-full bg-banyan rounded-full" style={{ width: `${Math.min(100, (f.amount_paid / f.amount_due) * 100)}%` }} />
              </div>
            </div>
          ))}
          {fees.length === 0 && <p className="text-ink/40 font-mono text-sm">No fee records yet.</p>}
        </div>
      </div>
    </div>
  )
}
