import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
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
  homepage: string
  language: string
  license: string
  openIssues: number
  defaultBranch: string
  readme: string
}

/* ─── Load enriched data ─── */
let pluginsData: Plugin[] = []
try {
  pluginsData = (await import('../data/plugins-enriched.json')).default as Plugin[]
} catch {
  try {
    const base = (await import('../data/plugins.json')).default as Record<string, unknown>[]
    pluginsData = base.map(p => ({
      stars: 0,
      forks: 0,
      githubDescription: '',
      updatedAt: '',
      createdAt: '',
      homepage: '',
      language: '',
      license: '',
      openIssues: 0,
      defaultBranch: 'main',
      readme: '',
      ...p,
    })) as Plugin[]
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
  if (days < 30) return `${days} days ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

const TYPE_COLORS: Record<string, string> = {
  YAML: '#00b4d8',
  TS: '#7b61ff',
}

/* ─── Main Component ─── */
export function PluginDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const headerRef = useFadeIn()
  const contentRef = useFadeIn()
  const [copied, setCopied] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [slug])

  const plugin = useMemo(() =>
    pluginsData.find(p => p.slug === slug),
    [slug]
  )

  const readmeHtml = useMemo(() => {
    if (!plugin?.readme) return ''
    const raw = marked.parse(plugin.readme) as string
    return DOMPurify.sanitize(raw, {
      ADD_TAGS: ['img'],
      ADD_ATTR: ['target', 'rel'],
    })
  }, [plugin])

  const handleCopy = () => {
    if (!plugin) return
    navigator.clipboard.writeText(plugin.installCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!plugin) {
    return (
      <div className="plugin-detail">
        <div className="container">
          <div className="plugin-not-found">
            <span className="plugins-empty-icon">🔌</span>
            <h2>Plugin not found</h2>
            <p>The plugin "{slug}" doesn't exist in our registry.</p>
            <Link to="/plugins" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              ← Back to Plugins
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const typeColor = TYPE_COLORS[plugin.type] || '#00e5a0'

  return (
    <div className="plugin-detail">
      <div className="container">
        {/* Back nav */}
        <Link to="/plugins" className="plugin-detail-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Plugins
        </Link>

        {/* Header */}
        <div className="plugin-detail-header fade-in" ref={headerRef}>
          <div className="plugin-detail-header-top">
            <div className="plugin-detail-name-area">
              <span className="plugin-detail-name" style={{ backgroundColor: typeColor }}>
                {plugin.name.replace('opencli-plugin-', '')}
              </span>
              <span className="plugin-detail-author">
                by {plugin.author.toUpperCase()}
              </span>
            </div>
            <div className="plugin-card-stats">
              <span className="plugin-stat" title="Forks">
                {formatNumber(plugin.forks)}
                <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm12-2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM7 9v4.17A3.001 3.001 0 0 1 6 13h0a3.001 3.001 0 0 1-1 .17V9h2zm10-2h2v4.5a3.5 3.5 0 0 1-3.5 3.5H10v-2h5.5a1.5 1.5 0 0 0 1.5-1.5V7z" /></svg>
              </span>
              <span className="plugin-stat" title="GitHub Stars">
                {formatNumber(plugin.stars)}
                <svg className="stat-icon" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
              </span>
            </div>
          </div>
          <p className="plugin-detail-desc">
            {plugin.githubDescription || plugin.description}
          </p>
        </div>

        {/* Content Grid */}
        <div className="plugin-detail-grid fade-in" ref={contentRef}>
          {/* Main content */}
          <div className="plugin-detail-main">
            {/* Install */}
            <div className="plugin-detail-section">
              <h3 className="plugin-detail-section-title">Install</h3>
              <div className="plugin-detail-install">
                <div className="terminal">
                  <div className="terminal-header">
                    <span className="terminal-dot" />
                    <span className="terminal-dot" />
                    <span className="terminal-dot" />
                    <span className="terminal-title">Install Plugin</span>
                  </div>
                  <div className="terminal-body">
                    <div className="terminal-line">
                      <span className="terminal-prompt">$</span>
                      <span className="terminal-cmd">{plugin.installCommand}</span>
                    </div>
                  </div>
                </div>
                <button className="plugin-copy-btn" onClick={handleCopy} title="Copy install command">
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>

            {/* README */}
            {readmeHtml && (
              <div className="plugin-detail-section">
                <h3 className="plugin-detail-section-title">{plugin.name.toUpperCase()}</h3>
                <div
                  className="plugin-readme"
                  dangerouslySetInnerHTML={{ __html: readmeHtml }}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="plugin-detail-sidebar">
            {/* Meta */}
            <div className="plugin-detail-meta-card">
              <div className="plugin-meta-row">
                <span className="plugin-meta-label">Created</span>
                <span className="plugin-meta-value">{timeAgo(plugin.createdAt)}</span>
              </div>
              <div className="plugin-meta-row">
                <span className="plugin-meta-label">Updated</span>
                <span className="plugin-meta-value">{timeAgo(plugin.updatedAt)}</span>
              </div>
              <div className="plugin-meta-row">
                <span className="plugin-meta-label">Type</span>
                <span className="plugin-type-badge" style={{ borderColor: typeColor, color: typeColor }}>
                  {plugin.type}
                </span>
              </div>
              {plugin.language && (
                <div className="plugin-meta-row">
                  <span className="plugin-meta-label">Language</span>
                  <span className="plugin-meta-value">{plugin.language}</span>
                </div>
              )}
              {plugin.license && (
                <div className="plugin-meta-row">
                  <span className="plugin-meta-label">License</span>
                  <span className="plugin-meta-value">{plugin.license}</span>
                </div>
              )}
            </div>

            {/* Links */}
            <div className="plugin-detail-links">
              <a
                href={`https://github.com/${plugin.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="plugin-link-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>

            {/* Tags */}
            {plugin.tags.length > 0 && (
              <div className="plugin-detail-tags">
                <h4 className="plugin-sidebar-title">Tags</h4>
                <div className="plugin-tags-list">
                  {plugin.tags.map(t => (
                    <span key={t} className="cmd-tag">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Commands */}
            {plugin.commands.length > 0 && (
              <div className="plugin-detail-commands">
                <h4 className="plugin-sidebar-title">Commands</h4>
                <div className="plugin-tags-list">
                  {plugin.commands.map(c => (
                    <span key={c} className="cmd-tag">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
