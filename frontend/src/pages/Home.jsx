import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Users, Globe2, HeartHandshake, CalendarDays } from 'lucide-react'
import api from '../api/client'
import { SubjectLedgerCard } from '../components/SyllabusLedger'

const pillars = [
  { icon: BookOpen, title: 'Quality Education', desc: 'A rigorous, well-sequenced curriculum delivered by qualified faculty.' },
  { icon: Users, title: 'Holistic Development', desc: 'Academics balanced with sport, art and leadership opportunity.' },
  { icon: HeartHandshake, title: 'Value-Based Learning', desc: 'Character and community woven into every classroom.' },
  { icon: Globe2, title: 'Global Perspective', desc: 'Preparing students to think, and belong, beyond borders.' },
]

export default function Home() {
  const [classes, setClasses] = useState([])
  const [activeClass, setActiveClass] = useState(null)
  const [events, setEvents] = useState([])
  const [posts, setPosts] = useState([])

  useEffect(() => {
    api.get('/classes').then((res) => {
      setClasses(res.data)
      if (res.data.length) setActiveClass(res.data[2]?.id || res.data[0].id)
    }).catch(() => {})
    api.get('/events').then((res) => setEvents(res.data.slice(0, 3))).catch(() => {})
    api.get('/blog').then((res) => setPosts(res.data.slice(0, 2))).catch(() => {})
  }, [])

  const currentClass = classes.find((c) => c.id === activeClass)

  return (
    <div>
      {/* HERO — styled as an open ledger/notebook spread */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 pt-10 lg:pt-16 pb-16">
        <div className="grid lg:grid-cols-2 rounded-[28px] overflow-hidden shadow-xl shadow-ink/10 border border-ink/10">
          {/* left leaf */}
          <div className="bg-ink text-parchment px-8 py-14 lg:px-12 lg:py-16 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full border border-marigold/20" />
            <div className="absolute -right-6 -bottom-24 w-48 h-48 rounded-full border border-banyan/20" />
            <span className="inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-marigold mb-6 relative">
              School Code 11654 · Affiliation No. 430563
            </span>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.08] font-medium relative">
              Every chapter,<br />tracked and shared —<br />
              <span className="text-marigold">not just taught.</span>
            </h1>
            <p className="mt-6 text-parchment/70 text-[1.02rem] max-w-md relative">
              Shree Krishna International School, Kalwada, gives parents a live,
              chapter-by-chapter view of the syllabus alongside admissions, attendance,
              results and fees — all in one place.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 relative">
              <Link to="/admissions" className="inline-flex items-center gap-2 bg-marigold hover:bg-marigold-dark transition-colors text-white font-semibold text-sm px-6 py-3.5 rounded-full">
                Apply for Admission <ArrowRight size={16} />
              </Link>
              <Link to="/academics" className="inline-flex items-center gap-2 border border-parchment/30 hover:border-parchment/60 transition-colors text-parchment text-sm font-semibold px-6 py-3.5 rounded-full">
                Explore the Syllabus Tracker
              </Link>
            </div>
          </div>

          {/* right leaf — live syllabus ledger preview */}
          <div className="bg-parchment px-8 py-10 lg:px-10 lg:py-12 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink/45">Live preview</div>
                <div className="font-display text-lg text-ink">Syllabus Ledger</div>
              </div>
              {classes.length > 0 && (
                <select
                  value={activeClass || ''}
                  onChange={(e) => setActiveClass(Number(e.target.value))}
                  className="font-mono text-xs border border-ink/15 rounded-full px-3 py-1.5 bg-white text-ink/80"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                  ))}
                </select>
              )}
            </div>

            {currentClass ? (
              <div className="space-y-4 overflow-y-auto max-h-[440px] pr-1">
                {currentClass.subjects.slice(0, 2).map((s) => (
                  <SubjectLedgerCard key={s.id} subject={s} />
                ))}
              </div>
            ) : (
              <div className="text-sm text-ink/40 font-mono py-10 text-center">Loading syllabus…</div>
            )}
            <Link to="/academics" className="mt-5 text-sm font-semibold text-ink/70 hover:text-ink inline-flex items-center gap-1.5">
              View full syllabus tracker <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <div key={p.title} className="border border-ink/10 rounded-2xl p-6 bg-white/50 hover:bg-white transition-colors">
              <div className="w-11 h-11 rounded-xl bg-banyan/10 text-banyan-dark flex items-center justify-center mb-4">
                <p.icon size={20} />
              </div>
              <h3 className="font-display text-lg text-ink mb-1.5">{p.title}</h3>
              <p className="text-sm text-ink/60 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EVENTS + NEWS */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-16 grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-marigold-dark mb-2">What's on</div>
          <h2 className="font-display text-2xl text-ink mb-6">Upcoming at SKIS</h2>
          <div className="space-y-4">
            {events.map((e) => (
              <div key={e.id} className="flex gap-4 border-b border-ink/10 pb-4">
                <div className="w-14 h-14 rounded-xl bg-ink text-parchment flex flex-col items-center justify-center shrink-0 font-mono">
                  <span className="text-[0.6rem] uppercase">{new Date(e.event_date).toLocaleString('en-US', { month: 'short' })}</span>
                  <span className="text-lg font-semibold leading-none">{new Date(e.event_date).getDate()}</span>
                </div>
                <div>
                  <h4 className="font-medium text-ink text-[0.95rem]">{e.title}</h4>
                  <p className="text-xs text-ink/55 mt-1 flex items-center gap-1.5"><CalendarDays size={12} /> {e.location}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/events" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink/70 hover:text-ink">
            All events <ArrowRight size={14} />
          </Link>
        </div>

        <div className="lg:col-span-3">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-marigold-dark mb-2">From the school</div>
          <h2 className="font-display text-2xl text-ink mb-6">Latest News</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {posts.map((p) => (
              <Link to={`/news/${p.slug}`} key={p.id} className="block border border-ink/10 rounded-2xl p-6 bg-white/50 hover:bg-white transition-colors">
                <h4 className="font-display text-lg text-ink mb-2 leading-snug">{p.title}</h4>
                <p className="text-sm text-ink/60 leading-relaxed line-clamp-3">{p.excerpt}</p>
                <span className="text-xs font-mono text-marigold-dark mt-3 inline-block">Read more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 pb-20">
        <div className="bg-banyan-dark rounded-[28px] px-8 py-14 lg:px-16 text-center text-parchment">
          <h2 className="font-display text-3xl lg:text-4xl font-medium mb-4">Admissions for 2026–27 are open</h2>
          <p className="text-parchment/75 max-w-xl mx-auto mb-8">
            Join a school where every parent can watch progress unfold — chapter by chapter, term by term.
          </p>
          <Link to="/admissions" className="inline-flex items-center gap-2 bg-marigold hover:bg-marigold-dark transition-colors text-white font-semibold text-sm px-7 py-3.5 rounded-full">
            Start Your Application <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
