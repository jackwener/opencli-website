import { useFadeIn } from './useFadeIn'

export function CTA() {
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

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <span>© 2025-2026 OpenCLI</span>
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
