import { useEffect, useState } from 'react'
import api from '../api/client'
import { SubjectLedgerCard } from '../components/SyllabusLedger'

export default function Academics() {
  const [classes, setClasses] = useState([])
  const [activeClass, setActiveClass] = useState(null)

  useEffect(() => {
    api.get('/classes').then((res) => {
      setClasses(res.data)
      if (res.data.length) setActiveClass(res.data[0].id)
    })
  }, [])

  const currentClass = classes.find((c) => c.id === activeClass)

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-16">
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-marigold-dark mb-3">Academics</div>
      <h1 className="font-display text-4xl text-ink mb-4 max-w-2xl">The Syllabus Tracker</h1>
      <p className="text-ink/65 max-w-2xl leading-relaxed">
        Every chapter your child's teacher plans, teaches and completes is logged here in real time.
        Select a grade to see exactly where each subject stands this term. Students and parents get
        a personalised version of this same view inside the portal.
      </p>

      <div className="flex flex-wrap gap-2 mt-8 mb-10">
        {classes.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveClass(c.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              activeClass === c.id
                ? 'bg-ink text-parchment border-ink'
                : 'border-ink/15 text-ink/65 hover:border-ink/40'
            }`}
          >
            {c.name} - {c.section}
          </button>
        ))}
      </div>

      {currentClass ? (
        <div className="grid md:grid-cols-2 gap-6">
          {currentClass.subjects.map((s) => (
            <SubjectLedgerCard key={s.id} subject={s} />
          ))}
        </div>
      ) : (
        <div className="text-ink/40 font-mono text-sm py-16 text-center">Loading syllabus…</div>
      )}
    </div>
  )
}
