import { useState } from 'react'
import { useFadeIn } from './useFadeIn'
import { PLATFORMS, FILTER_CATEGORIES, CATEGORY_LABELS, type Category } from './data'

function PlatformsTable() {
  const ref = useFadeIn()
  const [active, setActive] = useState<Category>('all')
  const filtered = active === 'all' ? PLATFORMS : PLATFORMS.filter(p => p.category.includes(active))

  return (
    <div className="platforms-table-wrap fade-in" ref={ref}>
      <div className="platform-filters">
        {FILTER_CATEGORIES.map(c => (
          <button
            key={c}
            className={`platform-filter-btn${active === c ? ' active' : ''}`}
            onClick={() => setActive(c)}
          >
            {CATEGORY_LABELS[c]}
            {c !== 'all' && <span className="filter-count">{PLATFORMS.filter(p => p.category.includes(c)).length}</span>}
          </button>
        ))}
      </div>
      <div className="platforms-table-scroll">
        <table className="platforms-table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Mode</th>
              <th>Available Commands</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.name}>
                <td>
                  <span className="platform-name">{p.name}</span>
                </td>
                <td>
                  <span className={`platform-mode mode-${p.mode}`}>{p.mode}</span>
                </td>
                <td>
                  <div className="platform-commands">
                    {p.commands.map((c) => (
                      <span key={c} className="cmd-tag">{c}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Platforms() {
  const ref = useFadeIn()
  return (
    <section className="platforms" id="platforms">
      <div className="container">
        <div className="platforms-header fade-in" ref={ref}>
          <span className="section-label">Integrations</span>
          <h2 className="section-title">{PLATFORMS.length} platforms,<br />one interface</h2>
          <p className="section-desc">
            Browser APIs, desktop apps, and public feeds — all accessible through clean CLI commands.
          </p>
        </div>
        <PlatformsTable />
      </div>
    </section>
  )
}
