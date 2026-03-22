import { useEffect, useRef } from 'react'
import ParticleBackground from './ParticleBackground'

/* ─── Platform Data ─── */
const PLATFORMS = [
  { name: 'Twitter / X', mode: 'browser', commands: ['trending', 'bookmarks', 'profile', 'search', 'timeline', 'post', 'reply', 'download'] },
  { name: 'Cursor', mode: 'desktop', commands: ['status', 'send', 'read', 'new', 'composer', 'model', 'ask', 'screenshot'] },
  { name: 'Bilibili', mode: 'browser', commands: ['hot', 'search', 'me', 'favorite', 'history', 'feed', 'subtitle', 'download'] },
  { name: 'Reddit', mode: 'browser', commands: ['hot', 'frontpage', 'popular', 'search', 'subreddit', 'read', 'comment', 'save'] },
  { name: 'Codex', mode: 'desktop', commands: ['status', 'send', 'read', 'new', 'extract-diff', 'model', 'ask', 'history'] },
  { name: 'Notion', mode: 'desktop', commands: ['status', 'search', 'read', 'new', 'write', 'sidebar', 'favorites', 'export'] },
  { name: 'YouTube', mode: 'browser', commands: ['search', 'video', 'transcript'] },
  { name: '小红书', mode: 'browser', commands: ['search', 'notifications', 'feed', 'me', 'user', 'download'] },
  { name: 'ChatGPT', mode: 'desktop', commands: ['status', 'new', 'send', 'read', 'ask'] },
  { name: 'Discord', mode: 'desktop', commands: ['status', 'send', 'read', 'channels', 'servers', 'search'] },
  { name: 'GitHub', mode: 'public', commands: ['search'] },
  { name: 'Hacker News', mode: 'public', commands: ['top'] },
]

const FEATURES = [
  {
    icon: '🛡️',
    title: 'Account Safe',
    desc: 'Reuses Chrome\'s logged-in state. Your credentials never leave the browser — zero security risk.',
  },
  {
    icon: '🤖',
    title: 'AI Agent Ready',
    desc: 'Built-in explore, synthesize, and cascade commands. AI discovers APIs and generates adapters automatically.',
  },
  {
    icon: '🖥️',
    title: 'Desktop Apps Too',
    desc: 'CLI-ify Electron apps like Cursor, Codex, ChatGPT, Notion, Discord — AI can now control itself natively.',
  },
  {
    icon: '⚡',
    title: 'Dual Engine',
    desc: 'YAML declarative pipelines for simple flows. TypeScript adapters for robust browser runtime injection.',
  },
  {
    icon: '🔄',
    title: 'Self-Healing',
    desc: 'Built-in setup wizard and doctor command. Auto-diagnoses daemon, extension, and browser connectivity.',
  },
  {
    icon: '📦',
    title: 'Dynamic Loader',
    desc: 'Drop .ts or .yaml adapters into the clis/ folder — auto-registered, zero config. Extend in seconds.',
  },
]

/* ─── Intersection Observer Hook ─── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

/* ─── Components ─── */
function Nav() {
  return (
    <nav className="nav" id="nav">
      <div className="container nav-inner">
        <a href="#" className="nav-logo">
          <span className="nav-logo-icon">&gt;_</span>
          OpenCLI
        </a>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#platforms">Platforms</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="/docs/">Docs</a></li>
        </ul>
        <a
          href="https://github.com/jackwener/opencli"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-cta"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </a>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-glow" />
      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          v{import.meta.env.VITE_OPENCLI_VERSION || '1.0'} — Now with Desktop App Support
        </div>
        <h1>
          Make Any Website
          <br />
          <span className="gradient-text">Your CLI</span>
        </h1>
        <p className="hero-desc">
          Turn any website or Electron app into a powerful command-line interface.
          Zero risk. Reuse Chrome login. AI-powered discovery.
        </p>
        <div className="hero-actions">
          <a
            href="https://www.npmjs.com/package/@jackwener/opencli"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            Get Started
          </a>
          <a
            href="https://github.com/jackwener/opencli"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>

        <div className="hero-terminal">
          <div className="terminal">
            <div className="terminal-header">
              <span className="terminal-dot" />
              <span className="terminal-dot" />
              <span className="terminal-dot" />
              <span className="terminal-title">zsh — opencli</span>
            </div>
            <div className="terminal-body">
              <div className="terminal-line">
                <span className="terminal-prompt">$</span>
                <span className="terminal-cmd">npm install -g @jackwener/opencli</span>
              </div>
              <div className="terminal-line">
                <span className="terminal-prompt">$</span>
                <span className="terminal-cmd">opencli bilibili hot --limit 5</span>
              </div>
              <div className="terminal-output">┌─ Bilibili Hot Videos ──────────────────────┐</div>
              <div className="terminal-output">│ # │ Title               │ Views    │ Score │</div>
              <div className="terminal-output">│ 1 │ 你不知道的编程技巧    │ 1.2M     │ 98    │</div>
              <div className="terminal-output">│ 2 │ 2026年最佳开源项目    │ 890K     │ 95    │</div>
              <div className="terminal-output">└────────────────────────────────────────────┘</div>
              <div className="terminal-line" style={{ marginTop: '0.5rem' }}>
                <span className="terminal-prompt">$</span>
                <span className="terminal-cmd">opencli twitter trending</span>
                <span className="terminal-comment"> &nbsp;# reuses Chrome login</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  const ref = useFadeIn()
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="features-header fade-in" ref={ref}>
          <span className="section-label">Features</span>
          <h2 className="section-title">Built for power users<br />& AI agents alike</h2>
          <p className="section-desc">
            A dual-engine architecture that bridges websites and desktop apps into a unified CLI experience.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} {...f} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${delay}s`
          el.classList.add('visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div className="feature-card fade-in" ref={ref}>
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  )
}

function Platforms() {
  const ref = useFadeIn()
  return (
    <section className="platforms" id="platforms">
      <div className="container">
        <div className="platforms-header fade-in" ref={ref}>
          <span className="section-label">Integrations</span>
          <h2 className="section-title">30+ platforms,<br />one interface</h2>
          <p className="section-desc">
            Browser APIs, desktop apps, and public feeds — all accessible through clean CLI commands.
          </p>
        </div>
        <PlatformsTable />
      </div>
    </section>
  )
}

function PlatformsTable() {
  const ref = useFadeIn()
  return (
    <div className="platforms-table-wrap fade-in" ref={ref}>
      <table className="platforms-table">
        <thead>
          <tr>
            <th>Platform</th>
            <th>Mode</th>
            <th>Available Commands</th>
          </tr>
        </thead>
        <tbody>
          {PLATFORMS.map((p) => (
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
  )
}

function HowItWorks() {
  const ref = useFadeIn()
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <div className="how-header fade-in" ref={ref}>
          <span className="section-label">How It Works</span>
          <h2 className="section-title">From install to<br />CLI in 60 seconds</h2>
          <p className="section-desc">
            No tokens. No scraping. Just your browser session, bridged securely to a CLI.
          </p>
        </div>
        <Steps />
      </div>
    </section>
  )
}

function Steps() {
  const steps = [
    {
      num: '01',
      title: 'Install',
      desc: 'One npm command. Works globally, instantly.',
      code: 'npm i -g @jackwener/opencli',
    },
    {
      num: '02',
      title: 'Bridge',
      desc: 'Load the Browser Bridge extension in Chrome. Auto-connects with zero config.',
      code: 'opencli setup',
    },
    {
      num: '03',
      title: 'Login',
      desc: 'Just browse normally. OpenCLI reuses your existing logged-in sessions.',
      code: null,
    },
    {
      num: '04',
      title: 'Command',
      desc: 'Run any supported command. Data flows from your browser to your terminal.',
      code: 'opencli bilibili hot',
    },
  ]

  return (
    <div className="steps">
      {steps.map((s, i) => {
        const ref = useRef<HTMLDivElement>(null)
        useEffect(() => {
          const el = ref.current
          if (!el) return
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                el.style.transitionDelay = `${i * 0.12}s`
                el.classList.add('visible')
                observer.unobserve(el)
              }
            },
            { threshold: 0.2 }
          )
          observer.observe(el)
          return () => observer.disconnect()
        }, [])

        return (
          <div className="step fade-in" key={s.num} ref={ref}>
            <div className="step-number">{s.num}</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            {s.code && <span className="step-code">{s.code}</span>}
          </div>
        )
      })}
    </div>
  )
}

function CTA() {
  const ref = useFadeIn()
  const handleCopy = () => {
    navigator.clipboard.writeText('npm install -g @jackwener/opencli')
  }

  return (
    <section className="cta" id="cta">
      <div className="container">
        <div className="cta-inner fade-in" ref={ref}>
          <div className="cta-glow" />
          <h2>Ready to CLI everything?</h2>
          <p>Join developers who turn the web into their terminal.</p>
          <div className="cta-actions">
            <button className="cta-install" onClick={handleCopy} title="Click to copy">
              <span>npm install -g @jackwener/opencli</span>
              <span className="cta-install-copy">📋</span>
            </button>
            <a
              href="https://github.com/jackwener/opencli"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Star on GitHub ⭐
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <span>© 2025 OpenCLI</span>
          <span>·</span>
          <span>Apache-2.0 License</span>
        </div>
        <ul className="footer-links">
          <li><a href="/docs/">Documentation</a></li>
          <li><a href="https://github.com/jackwener/opencli" target="_blank" rel="noopener">GitHub</a></li>
          <li><a href="https://www.npmjs.com/package/@jackwener/opencli" target="_blank" rel="noopener">npm</a></li>
        </ul>
      </div>
    </footer>
  )
}

/* ─── App ─── */
export default function App() {
  return (
    <>
      <ParticleBackground />
      <div className="noise-overlay" />
      <Nav />
      <Hero />
      <div className="main-content">
        <Features />
        <Platforms />
        <HowItWorks />
        <CTA />
        <Footer />
      </div>
    </>
  )
}
