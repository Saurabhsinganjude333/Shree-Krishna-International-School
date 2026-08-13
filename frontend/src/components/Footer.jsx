import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, GraduationCap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-ink text-parchment/90 mt-24">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-full bg-marigold text-ink flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
            <span className="font-display font-semibold text-lg">SKIS</span>
          </div>
          <p className="text-sm text-parchment/60 leading-relaxed">
            Preparing students for the universe — quality education, holistic development
            and value-based learning in Kalwada, Valsad.
          </p>
        </div>

        <div>
          <div className="font-mono text-xs uppercase tracking-[0.15em] text-marigold mb-4">Explore</div>
          <ul className="space-y-2.5 text-sm text-parchment/70">
            <li><Link to="/about" className="hover:text-parchment">About the School</Link></li>
            <li><Link to="/academics" className="hover:text-parchment">Academics &amp; Syllabus</Link></li>
            <li><Link to="/admissions" className="hover:text-parchment">Admissions</Link></li>
            <li><Link to="/gallery" className="hover:text-parchment">Gallery</Link></li>
            <li><Link to="/events" className="hover:text-parchment">Events</Link></li>
            <li><Link to="/news" className="hover:text-parchment">News &amp; Blog</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-mono text-xs uppercase tracking-[0.15em] text-marigold mb-4">Portal</div>
          <ul className="space-y-2.5 text-sm text-parchment/70">
            <li><Link to="/login" className="hover:text-parchment">Student Login</Link></li>
            <li><Link to="/login" className="hover:text-parchment">Parent Login</Link></li>
            <li><Link to="/login" className="hover:text-parchment">Teacher Login</Link></li>
            <li><Link to="/login" className="hover:text-parchment">Admin Login</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-mono text-xs uppercase tracking-[0.15em] text-marigold mb-4">Reach Us</div>
          <ul className="space-y-3 text-sm text-parchment/70">
            <li className="flex items-start gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0 text-marigold" /> Kalwada, Valsad, Gujarat, India</li>
            <li className="flex items-center gap-2.5"><Phone size={16} className="text-marigold" /> +91 98765 43210</li>
            <li className="flex items-center gap-2.5"><Mail size={16} className="text-marigold" /> info@skis.edu.in</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-parchment/10">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-parchment/50 font-mono">
          <span>School Code 11654 &nbsp;·&nbsp; Affiliation No. 430563</span>
          <span>© {new Date().getFullYear()} Shree Krishna International School. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
