import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../api/client'

export default function NewsDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.get(`/blog/${slug}`).then((res) => setPost(res.data)).catch(() => setNotFound(true))
  }, [slug])

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <p className="text-ink/50 font-mono">Post not found.</p>
        <Link to="/news" className="text-marigold-dark font-semibold text-sm mt-4 inline-block">← Back to News</Link>
      </div>
    )
  }
  if (!post) return null

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-8 py-16">
      <Link to="/news" className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink mb-8">
        <ArrowLeft size={14} /> Back to News
      </Link>
      <span className="text-xs font-mono text-ink/40">
        {new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        {post.author ? ` · ${post.author}` : ''}
      </span>
      <h1 className="font-display text-3xl text-ink mt-2 mb-6 leading-tight">{post.title}</h1>
      <p className="text-ink/75 leading-relaxed whitespace-pre-line">{post.content}</p>
    </div>
  )
}
