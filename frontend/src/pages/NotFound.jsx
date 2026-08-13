import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-5 py-32 text-center">
      <div className="font-display text-6xl text-ink/15 mb-4">404</div>
      <h1 className="font-display text-2xl text-ink mb-3">Page not found</h1>
      <p className="text-ink/55 text-sm mb-8">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="bg-marigold hover:bg-marigold-dark text-white font-semibold text-sm px-6 py-3 rounded-full transition-colors">
        Back to Home
      </Link>
    </div>
  )
}
