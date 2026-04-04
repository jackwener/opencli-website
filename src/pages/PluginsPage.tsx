import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useFadeIn } from '../components/useFadeIn'

/* ─── Types ─── */
interface Plugin {
  name: string
  slug: string
  description: string
  author: string
  repo: string
  type: string
  category: string
  commands: string[]
  tags: string[]
  installCommand: string
  stars: number
  forks: number
  githubDescription: string
  updatedAt: string
  createdAt: string
  readme: string
}

type SortKey = 'stars' | 'updated' | 'name'
type CategoryFilter = 'all' | 'dev' | 'social' | 'chinese' | 'utility'

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All',
  dev: 'Dev & News',
  social: 'Social',
  chinese: '中文平台',
  utility: 'Utilities',
}

const SORT_LABELS: Record<SortKey, string> = {
  stars: '⭐ Stars',
  updated: '🕐 Updated',
  name: 'A→Z Name',
}

const TYPE_COLORS: Record<string, string> = {
  YAML: '#00b4d8',
  TS: '#7b61ff',
}

/* ─── Load enriched data ─── */
let pluginsData: Plugin[] = []
try {
  pluginsData = (await import('../data/plugins-enriched.json')).default as Plugin[]
} catch {
  // Fallback to base data if enriched not available
  try {
    const base = (await import('../data/plugins.json')).default as Omit<Plugin, 'stars' | 'forks' | 'githubDescription' | 'updatedAt' | 'createdAt' | 'readme'>[]
    pluginsData = base.map(p => ({
      ...p,
      stars: 0,
      forks: 0,
      githubDescription: '',
      updatedAt: '',
      createdAt: '',
      readme: '',
    }))
  } catch {
    pluginsData = []
  }
}

/* ─── Helpers ─── */
function timeAgo(dateStr: string): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'today'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

/* ─── Plugin Card ─── */
function PluginCard({ plugin, index }: { plugin: Plugin; index: number }) {
  const ref = useFadeIn()
  const typeColor = TYPE_COLORS[plugin.type] || '#00e5a0'

  return (
    <div
      className="plugin-card fade-in"
      ref={ref}
      style={{ animationDelay: `${index * 0.05}s` } as React.CSSProperties}
      id={`plugin-${plugin.slug}`}
    >
      <Link to={`/plugins/${plugin.slug}`} className="plugin-card-link">
        <div className="plugin-card-top">
          <div className="plugin-card-left">
            <span className="plugin-card-name" style={{ backgroundColor: typeColor }}>
              {plugin.name.replace('opencli-plugin-', '')}
            </span>
            <span className="plugin-card-author">by {plugin.author.toUpperCase()}</span>
          </div>
          <div className="plugin-card-stats">
            <span className="plugin-stat" title="Forks">
              {formatNumber(plugin.forks)} <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm12-2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM7 9v4.17A3.001 3.001 0 0 1 6 13h0a3.001 3.001 0 0 1-1 .17V9h2zm10-2h2v4.5a3.5 3.5 0 0 1-3.5 3.5H10v-2h5.5a1.5 1.5 0 0 0 1.5-1.5V7z" /></svg>
            </span>
            <span className="plugin-stat" title="GitHub Stars">
              {formatNumber(plugin.stars)} <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
            </span>
          </div>
        </div>
        <div className="plugin-card-desc">
          {plugin.githubDescription || plugin.description}
        </div>
        <div className="plugin-card-footer">
          <span className="plugin-type-badge" style={{ borderColor: typeColor, color: typeColor }}>
            {plugin.type}
          </span>
          {plugin.updatedAt && (
            <span className="plugin-updated">Updated {timeAgo(plugin.updatedAt)}</span>
          )}
        </div>
      </Link>
    </div>
  )
}

/* ─── Main Page ─── */
export function PluginsPage() {
  const headerRef = useFadeIn()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [sort, setSort] = useState<SortKey>('stars')

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const filtered = useMemo(() => {
    let list = [...pluginsData]

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.githubDescription.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    // Category filter
    if (category !== 'all') {
      list = list.filter(p => p.category === category)
    }

    // Sort
    if (sort === 'stars') {
      list.sort((a, b) => b.stars - a.stars)
    } else if (sort === 'updated') {
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name))
    }

    return list
  }, [search, category, sort])

  const categories = useMemo(() => {
    const cats = new Set(pluginsData.map(p => p.category))
    return ['all', ...Array.from(cats)] as CategoryFilter[]
  }, [])

  return (
    <div className="plugins-page">
      <div className="container">
        {/* Header */}
        <div className="plugins-hero fade-in" ref={headerRef}>
          <div className="plugins-hero-glow" />
          <span className="section-label">Plugin Ecosystem</span>
          <h1 className="plugins-hero-title">
            Extend OpenCLI with<br />
            <span className="gradient-text">Community Plugins</span>
          </h1>
          <p className="plugins-hero-desc">
            Discover, install, and contribute plugins that add new commands and integrations to OpenCLI.
          </p>

          {/* Search */}
          <div className="plugins-search-wrap">
            <svg className="plugins-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="plugin-search"
              type="text"
              className="plugins-search"
              placeholder="Search plugins…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
            />
            <span className="plugins-search-hint">
              Tip: search by name, author, or tag
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="plugins-toolbar">
          <div className="plugins-filters">
            {categories.map(c => (
              <button
                key={c}
                className={`platform-filter-btn${category === c ? ' active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {CATEGORY_LABELS[c] || c}
                {c !== 'all' && (
                  <span className="filter-count">
                    {pluginsData.filter(p => p.category === c).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="plugins-sort">
            {(Object.keys(SORT_LABELS) as SortKey[]).map(k => (
              <button
                key={k}
                className={`plugins-sort-btn${sort === k ? ' active' : ''}`}
                onClick={() => setSort(k)}
              >
                {SORT_LABELS[k]}
              </button>
            ))}
          </div>
          <span className="plugins-count">
            {filtered.length} {filtered.length === 1 ? 'PLUGIN' : 'PLUGINS'}
          </span>
        </div>

        {/* Plugin List */}
        <div className="plugin-list">
          {filtered.length > 0 ? (
            filtered.map((p, i) => <PluginCard key={p.slug} plugin={p} index={i} />)
          ) : (
            <div className="plugins-empty">
              <span className="plugins-empty-icon">🔍</span>
              <p>No plugins found matching your search.</p>
            </div>
          )}
        </div>

        {/* Submit CTA */}
        <div className="plugins-submit">
          <div className="plugins-submit-inner">
            <div className="plugins-submit-glow" />
            <h3>Have a plugin?</h3>
            <p>Submit your OpenCLI plugin to the ecosystem — just open a PR.</p>
            <a
              href="https://github.com/jackwener/opencli-website/blob/main/CONTRIBUTING_PLUGINS.md"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Submit Plugin
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
