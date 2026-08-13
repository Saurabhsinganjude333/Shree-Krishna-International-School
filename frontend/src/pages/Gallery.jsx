import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => { api.get('/gallery').then((res) => setImages(res.data)) }, [])

  const categories = ['all', ...new Set(images.map((i) => i.category).filter(Boolean))]
  const shown = filter === 'all' ? images : images.filter((i) => i.category === filter)

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-16">
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-marigold-dark mb-3">Gallery</div>
      <h1 className="font-display text-4xl text-ink mb-8">Life at SKIS</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border capitalize transition-colors ${
              filter === c ? 'bg-ink text-parchment border-ink' : 'border-ink/15 text-ink/60 hover:border-ink/40'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
        {shown.map((img) => (
          <div key={img.id} className="break-inside-avoid rounded-2xl overflow-hidden border border-ink/10 bg-white">
            <img src={img.image_url} alt={img.title} className="w-full object-cover" loading="lazy" />
            <div className="p-4">
              <h4 className="font-medium text-ink text-sm">{img.title}</h4>
              <span className="text-xs font-mono text-ink/40 capitalize">{img.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
