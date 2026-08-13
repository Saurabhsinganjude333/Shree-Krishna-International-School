import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import api from '../api/client'

const grades = ['Nursery', 'LKG', 'UKG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10']

const steps = [
  { title: 'Submit Enquiry', desc: 'Fill the online form with your child\'s details.' },
  { title: 'Verification Call', desc: 'Our admissions team calls within 2 working days.' },
  { title: 'Campus Visit', desc: 'Tour the campus and meet faculty.' },
  { title: 'Confirm Admission', desc: 'Complete documentation and fee payment.' },
]

export default function Admissions() {
  const [form, setForm] = useState({
    student_name: '', dob: '', class_applying: '', parent_name: '',
    phone: '', email: '', address: '', message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = { ...form, dob: form.dob || null, email: form.email || null }
      await api.post('/admissions', payload)
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-16 grid lg:grid-cols-5 gap-12">
      <div className="lg:col-span-2">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-marigold-dark mb-3">Admissions 2026–27</div>
        <h1 className="font-display text-4xl text-ink mb-5">Begin your child's journey at SKIS</h1>
        <p className="text-ink/65 leading-relaxed mb-10">
          Submit an enquiry below — our admissions team will reach out to guide you through
          the next steps.
        </p>
        <div className="space-y-6">
          {steps.map((s, i) => (
            <div key={s.title} className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-ink text-parchment font-mono text-sm flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <div>
                <h4 className="font-medium text-ink text-[0.95rem]">{s.title}</h4>
                <p className="text-sm text-ink/55 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-3">
        {done ? (
          <div className="border border-banyan/30 bg-banyan/5 rounded-2xl p-10 text-center">
            <CheckCircle2 className="mx-auto text-banyan-dark mb-4" size={40} />
            <h3 className="font-display text-2xl text-ink mb-2">Enquiry received</h3>
            <p className="text-ink/60 max-w-sm mx-auto">
              Thank you — our admissions team will contact {form.parent_name || 'you'} within
              2 working days on {form.phone}.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="border border-ink/10 rounded-2xl p-7 sm:p-8 bg-white/60 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Student's Full Name" required>
                <input required value={form.student_name} onChange={update('student_name')} className="input" placeholder="e.g. Aarav Mehta" />
              </Field>
              <Field label="Date of Birth">
                <input type="date" value={form.dob} onChange={update('dob')} className="input" />
              </Field>
            </div>

            <Field label="Grade Applying For" required>
              <select required value={form.class_applying} onChange={update('class_applying')} className="input">
                <option value="">Select grade</option>
                {grades.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Parent / Guardian Name" required>
                <input required value={form.parent_name} onChange={update('parent_name')} className="input" placeholder="e.g. Sunita Mehta" />
              </Field>
              <Field label="Phone Number" required>
                <input required value={form.phone} onChange={update('phone')} className="input" placeholder="10-digit mobile number" />
              </Field>
            </div>

            <Field label="Email Address">
              <input type="email" value={form.email} onChange={update('email')} className="input" placeholder="you@example.com" />
            </Field>

            <Field label="Address">
              <textarea value={form.address} onChange={update('address')} rows={2} className="input resize-none" placeholder="Current residential address" />
            </Field>

            <Field label="Anything you'd like us to know?">
              <textarea value={form.message} onChange={update('message')} rows={3} className="input resize-none" placeholder="Questions, prior schooling, special requirements…" />
            </Field>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-marigold hover:bg-marigold-dark disabled:opacity-60 transition-colors text-white font-semibold text-sm py-3.5 rounded-full"
            >
              {submitting ? 'Submitting…' : 'Submit Enquiry'}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid rgba(15,42,74,0.15);
          border-radius: 0.75rem;
          padding: 0.7rem 0.9rem;
          font-size: 0.92rem;
          background: white;
          color: #1F2937;
        }
        .input:focus { outline: 2px solid #E8871E; outline-offset: 1px; }
      `}</style>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink/75 mb-1.5">
        {label}{required && <span className="text-marigold-dark"> *</span>}
      </span>
      {children}
    </label>
  )
}
