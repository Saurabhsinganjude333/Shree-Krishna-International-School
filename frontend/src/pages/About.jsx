import { GraduationCap, Target, Eye, Award } from 'lucide-react'

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-16">
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-marigold-dark mb-3">About the school</div>
      <h1 className="font-display text-4xl text-ink mb-6 max-w-2xl">
        Preparing students for the universe, from Kalwada, Valsad.
      </h1>
      <p className="text-ink/65 leading-relaxed max-w-2xl text-[1.02rem]">
        Shree Krishna International School (School Code 11654, Affiliation No. 430563) was founded
        on the belief that education should build both capability and character. We combine a
        disciplined academic core with holistic, value-based learning — and give families real
        visibility into how that learning progresses, day by day.
      </p>

      <div className="grid sm:grid-cols-3 gap-5 mt-12">
        <div className="border border-ink/10 rounded-2xl p-7 bg-white/50">
          <Target className="text-marigold-dark mb-4" size={26} />
          <h3 className="font-display text-lg text-ink mb-2">Our Mission</h3>
          <p className="text-sm text-ink/60 leading-relaxed">
            To deliver a globally-aware, values-rooted education that equips every student
            to think critically and act with integrity.
          </p>
        </div>
        <div className="border border-ink/10 rounded-2xl p-7 bg-white/50">
          <Eye className="text-marigold-dark mb-4" size={26} />
          <h3 className="font-display text-lg text-ink mb-2">Our Vision</h3>
          <p className="text-sm text-ink/60 leading-relaxed">
            A learning community where curiosity is nurtured, progress is transparent, and
            every child is prepared for a world without borders.
          </p>
        </div>
        <div className="border border-ink/10 rounded-2xl p-7 bg-white/50">
          <Award className="text-marigold-dark mb-4" size={26} />
          <h3 className="font-display text-lg text-ink mb-2">Our Promise</h3>
          <p className="text-sm text-ink/60 leading-relaxed">
            Parents are never in the dark. Attendance, syllabus progress, results and fees
            are visible in real time, always.
          </p>
        </div>
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="font-display text-2xl text-ink mb-4">Governance &amp; Recognition</h2>
          <ul className="space-y-3 text-sm text-ink/65">
            <li className="flex gap-2"><GraduationCap size={18} className="text-banyan-dark shrink-0 mt-0.5" /> Registered School Code: <strong className="text-ink">11654</strong></li>
            <li className="flex gap-2"><GraduationCap size={18} className="text-banyan-dark shrink-0 mt-0.5" /> Affiliation Number: <strong className="text-ink">430563</strong></li>
            <li className="flex gap-2"><GraduationCap size={18} className="text-banyan-dark shrink-0 mt-0.5" /> Location: Kalwada, Valsad, Gujarat</li>
            <li className="flex gap-2"><GraduationCap size={18} className="text-banyan-dark shrink-0 mt-0.5" /> Grades offered: Grade 6 through Grade 10 (expanding)</li>
          </ul>
        </div>
        <div className="bg-ink text-parchment rounded-2xl p-8">
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-marigold mb-3">In their words</div>
          <p className="font-display text-xl leading-snug">
            "The youth of today are the leaders of tomorrow. Let's inspire, empower and
            encourage them to build a peaceful, inclusive and sustainable world."
          </p>
        </div>
      </div>
    </div>
  )
}
