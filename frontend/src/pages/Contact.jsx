import { useState } from 'react'
import { MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react'
import api from '../api/client'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/contact', form)
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-16 grid lg:grid-cols-5 gap-12">
      <div className="lg:col-span-2">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-marigold-dark mb-3">Get in touch</div>
        <h1 className="font-display text-4xl text-ink mb-6">Contact Us</h1>
        <div className="space-y-5 text-sm text-ink/70">
          <p className="flex items-start gap-3"><MapPin size={18} className="text-banyan-dark mt-0.5 shrink-0" /> Shree Krishna International School, Kalwada, Valsad, Gujarat, India</p>
          <p className="flex items-center gap-3"><Phone size={18} className="text-banyan-dark shrink-0" /> +91 98765 43210</p>
          <p className="flex items-center gap-3"><Mail size={18} className="text-banyan-dark shrink-0" /> info@skis.edu.in</p>
        </div>
      </div>

      <div className="lg:col-span-3">
        {done ? (
          <div className="border border-banyan/30 bg-banyan/5 rounded-2xl p-10 text-center">
            <CheckCircle2 className="mx-auto text-banyan-dark mb-4" size={36} />
            <h3 className="font-display text-xl text-ink mb-2">Message sent</h3>
            <p className="text-ink/60 text-sm">We'll get back to you as soon as possible.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="border border-ink/10 rounded-2xl p-7 bg-white/60 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <input required placeholder="Your Name" value={form.name} onChange={update('name')} className="input" />
              <input required type="email" placeholder="Email Address" value={form.email} onChange={update('email')} className="input" />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <input placeholder="Phone Number" value={form.phone} onChange={update('phone')} className="input" />
              <input placeholder="Subject" value={form.subject} onChange={update('subject')} className="input" />
            </div>
            <textarea required rows={5} placeholder="Your message" value={form.message} onChange={update('message')} className="input resize-none" />
            <button type="submit" disabled={submitting} className="w-full bg-marigold hover:bg-marigold-dark disabled:opacity-60 text-white font-semibold text-sm py-3.5 rounded-full transition-colors">
              {submitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
        <style>{`
          .input { width: 100%; border: 1px solid rgba(15,42,74,0.15); border-radius: 0.75rem; padding: 0.7rem 0.9rem; font-size: 0.92rem; background: white; color:#1F2937; }
          .input:focus { outline: 2px solid #E8871E; outline-offset: 1px; }
        `}</style>
      </div>
    </div>
  )
}
