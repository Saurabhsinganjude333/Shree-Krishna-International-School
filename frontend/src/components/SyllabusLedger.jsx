const statusStyle = {
  completed: { label: 'Completed', color: 'text-banyan-dark', dot: 'bg-banyan' },
  in_progress: { label: 'In progress', color: 'text-marigold-dark', dot: 'bg-marigold' },
  not_started: { label: 'Upcoming', color: 'text-ink/40', dot: 'bg-ink/25' },
}

export function ChapterRow({ chapter }) {
  const style = statusStyle[chapter.status] || statusStyle.not_started
  return (
    <div className="flex items-center py-2.5 ledger-row">
      <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
      <span className="ml-3 text-[0.92rem] text-ink/85 whitespace-nowrap">{chapter.title}</span>
      <span className="dotted-leader" />
      <span className={`font-mono text-xs shrink-0 ${style.color}`}>
        {chapter.status === 'completed' ? '100%' : chapter.status === 'not_started' ? '—' : `${Math.round(chapter.completion_pct)}%`}
      </span>
    </div>
  )
}

export function SubjectLedgerCard({ subject }) {
  const total = subject.chapters?.length || 0
  const completed = subject.chapters?.filter((c) => c.status === 'completed').length || 0
  const avgPct = total
    ? Math.round(subject.chapters.reduce((s, c) => s + c.completion_pct, 0) / total)
    : 0

  return (
    <div className="bg-white/70 border border-ink/10 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-ink/45 mb-1">
            {completed}/{total} chapters complete
          </div>
          <h3 className="font-display text-xl text-ink font-medium">{subject.name}</h3>
        </div>
        <div className="relative w-14 h-14 shrink-0">
          <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#0F2A4A1a" strokeWidth="3.5" />
            <circle
              cx="18" cy="18" r="15.5" fill="none" stroke="#E8871E" strokeWidth="3.5"
              strokeDasharray={`${avgPct * 0.974} 1000`} strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[0.7rem] font-semibold text-ink">
            {avgPct}%
          </span>
        </div>
      </div>
      <div>
        {(subject.chapters || []).slice(0, 6).map((c) => <ChapterRow key={c.id} chapter={c} />)}
      </div>
    </div>
  )
}
