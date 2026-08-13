import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import api from '../api/client'

export default function Events() {
  const [events, setEvents] = useState([])
  useEffect(() => { api.get('/events').then((res) => setEvents(res.data)) }, [])

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-16">
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-marigold-dark mb-3">Calendar</div>
      <h1 className="font-display text-4xl text-ink mb-10">School Events</h1>

      <div className="space-y-4">
        {events.map((e) => (
          <div key={e.id} className="flex gap-5 border border-ink/10 rounded-2xl p-6 bg-white/50">
            <div className="w-16 h-16 rounded-xl bg-ink text-parchment flex flex-col items-center justify-center shrink-0 font-mono">
              <span className="text-[0.65rem] uppercase">{new Date(e.event_date).toLocaleString('en-US', { month: 'short' })}</span>
              <span className="text-xl font-semibold leading-none">{new Date(e.event_date).getDate()}</span>
            </div>
            <div>
              <h3 className="font-display text-lg text-ink mb-1">{e.title}</h3>
              <p className="text-sm text-ink/60 leading-relaxed mb-2">{e.description}</p>
              {e.location && (
                <span className="text-xs font-mono text-ink/45 flex items-center gap-1.5">
                  <MapPin size={12} /> {e.location}
                </span>
              )}
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-ink/40 font-mono text-sm">No upcoming events listed right now.</p>}
      </div>
    </div>
  )
}
