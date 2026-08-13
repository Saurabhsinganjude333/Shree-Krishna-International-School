import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function News() {
  const [posts, setPosts] = useState([])
  useEffect(() => { api.get('/blog').then((res) => setPosts(res.data)) }, [])

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-16">
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-marigold-dark mb-3">News &amp; Blog</div>
      <h1 className="font-display text-4xl text-ink mb-10">From the School</h1>

      <div className="grid sm:grid-cols-2 gap-6">
        {posts.map((p) => (
          <Link to={`/news/${p.slug}`} key={p.id} className="block border border-ink/10 rounded-2xl p-7 bg-white/50 hover:bg-white transition-colors">
            <span className="text-xs font-mono text-ink/40">
              {new Date(p.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <h3 className="font-display text-xl text-ink mt-2 mb-3 leading-snug">{p.title}</h3>
            <p className="text-sm text-ink/60 leading-relaxed line-clamp-3">{p.excerpt}</p>
            <span className="text-xs font-mono text-marigold-dark mt-4 inline-block">Read more →</span>
          </Link>
        ))}
        {posts.length === 0 && <p className="text-ink/40 font-mono text-sm">No posts published yet.</p>}
      </div>
    </div>
  )
}
