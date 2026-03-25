export function Hero() {
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
