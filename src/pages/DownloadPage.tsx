import { useEffect, useState } from 'react'
import { useFadeIn } from '../components/useFadeIn'

/* ─── Types ─── */

interface ReleaseAsset {
  name: string
  size: number
  browser_download_url: string
  digest: string | null // GitHub returns sha256:... or null
}

interface Release {
  tag_name: string
  name: string
  published_at: string
  html_url: string
  prerelease: boolean
  draft: boolean
  body: string
  assets: ReleaseAsset[]
}

interface PkgInfo {
  version: string
  releaseUrl: string
  publishedAt: string
  asset: ReleaseAsset
  sha256: string | null
}

/* ─── Constants ─── */

// Fallback used if the GitHub API is unreachable (offline preview, rate
// limited, network blocked). Update on each App release.
const FALLBACK: PkgInfo = {
  version: '0.1.9',
  releaseUrl: 'https://github.com/jackwener/opencli-website/releases/tag/app-v0.1.9',
  publishedAt: '',
  asset: {
    name: 'BrowserBridge_0.1.9_aarch64.pkg',
    size: 87_391_304,
    browser_download_url:
      'https://github.com/jackwener/opencli-website/releases/download/app-v0.1.9/BrowserBridge_0.1.9_aarch64.pkg',
    digest: null,
  },
  sha256: '7ee19060033ed669248c517eeae687403c1846b5015568ee15341f0390aa31ea',
}

// App releases live in the public `opencli-website` repo (not the private
// `OpenCLI-App` source repo), tagged `app-v*` so they don't collide with
// any future website-only tag. This is the same origin as the website
// itself, so the browser fetch is anonymous + cross-origin-allowed.
const RELEASES_API = 'https://api.github.com/repos/jackwener/opencli-website/releases'
const APP_TAG_PREFIX = 'app-v'

/* ─── Helpers ─── */

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(2)} GB`
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
  return `${bytes} B`
}

function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Pick the .pkg from the release assets. Prefers names matching the
 * Apple-Silicon BrowserBridge pattern, falls back to the first `.pkg` asset.
 */
function pickPkgAsset(assets: ReleaseAsset[]): ReleaseAsset | null {
  const pkgs = assets.filter((a) => a.name.toLowerCase().endsWith('.pkg'))
  if (pkgs.length === 0) return null
  // Prefer Apple Silicon / aarch64 builds.
  const arm = pkgs.find((a) => /aarch64|arm64/i.test(a.name))
  return arm ?? pkgs[0]
}

/**
 * GitHub asset.digest looks like `sha256:abcdef...`. Strip the prefix.
 */
function extractSha256(digest: string | null): string | null {
  if (!digest) return null
  const m = /^sha256:([0-9a-fA-F]{64})$/.exec(digest.trim())
  return m ? m[1].toLowerCase() : null
}

async function fetchLatestPkg(): Promise<PkgInfo | null> {
  const res = await fetch(RELEASES_API, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) return null
  const releases = (await res.json()) as Release[]
  // Only consider non-draft releases tagged with `app-v*` so any future
  // website-only release tag (e.g. a site redesign) doesn't accidentally
  // become the "App download" surfaced here. Most recent first.
  const candidates = releases.filter(
    (r) => !r.draft && r.tag_name.startsWith(APP_TAG_PREFIX),
  )
  for (const release of candidates) {
    const asset = pickPkgAsset(release.assets)
    if (!asset) continue
    return {
      version: release.tag_name.slice(APP_TAG_PREFIX.length) || release.name,
      releaseUrl: release.html_url,
      publishedAt: release.published_at,
      asset,
      sha256: extractSha256(asset.digest),
    }
  }
  return null
}

/* ─── Component ─── */

export function DownloadPage() {
  const fadeIn = useFadeIn()
  const [info, setInfo] = useState<PkgInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchLatestPkg()
      .then((latest) => {
        if (cancelled) return
        // The FALLBACK link is the same canonical Releases page the API
        // would have led to — silently swap in if the live fetch had
        // nothing matching `app-v*` yet, no scary warning needed.
        setInfo(latest ?? FALLBACK)
      })
      .catch(() => {
        if (cancelled) return
        setInfo(FALLBACK)
        setError("Couldn't reach GitHub — showing the latest known release info.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="download-page" ref={fadeIn}>
      <section className="download-hero">
        <div className="container">
          <h1 className="download-title">
            Download <span className="download-product">BrowserBridge</span>
          </h1>
          <p className="download-subtitle">
            The menu-bar companion app that lets <code>opencli</code> drive your
            already-signed-in browser sessions, without juggling profiles or
            shells. macOS only for now.
          </p>

          <div className="download-card">
            {loading ? (
              <div className="download-card-loading">Loading latest release…</div>
            ) : info ? (
              <>
                <div className="download-card-head">
                  <div>
                    <div className="download-version">v{info.version}</div>
                    {info.publishedAt && (
                      <div className="download-published">
                        Released {formatDate(info.publishedAt)}
                      </div>
                    )}
                  </div>
                  <div className="download-arch-chip">macOS · Apple Silicon</div>
                </div>

                <a
                  href={info.asset.browser_download_url}
                  className="download-primary-button"
                  download
                >
                  <span className="download-primary-icon">↓</span>
                  Download {info.asset.name}
                </a>

                <div className="download-size">
                  {formatBytes(info.asset.size)} · macOS double-click installer
                </div>

                {error && <div className="download-warning">{error}</div>}
              </>
            ) : (
              <div className="download-card-loading">Release info unavailable.</div>
            )}
          </div>

          <div className="download-altlink">
            <a
              href={info?.releaseUrl ?? FALLBACK.releaseUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              All releases & changelog →
            </a>
          </div>
        </div>
      </section>

      <section className="download-section">
        <div className="container download-narrow">
          <h2 className="download-section-title">What you get</h2>
          <ul className="download-features">
            <li>
              <strong>Menu-bar app</strong> — one click to open Browser Bridge
              status, runtime info, and quick toggles.
            </li>
            <li>
              <strong>Bundled <code>opencli</code></strong> — installs the
              <code> /usr/local/bin/opencli </code> shim wired to a
              version-matched OpenCLI runtime; nothing extra to <code>npm
              install</code>.
            </li>
            <li>
              <strong>Keep me signed in</strong> — daily background touch on
              each logged-in site so OpenCLI keeps working without surprise
              re-logins.
            </li>
            <li>
              <strong>Keep Mac Awake</strong> — privileged helper prevents
              clamshell sleep, with display still sleeping normally when the
              lid closes.
            </li>
            <li>
              <strong>Install OpenCLI Skills</strong> — copies the bundled{' '}
              <code>opencli-*</code> skills into Claude and Agents directories
              so other local AI assistants can read the same guidance.
            </li>
            <li>
              <strong>Launch at login</strong> — optional per-user LaunchAgent,
              opt-in, not installed by default.
            </li>
          </ul>
        </div>
      </section>

      <section className="download-section">
        <div className="container download-narrow">
          <h2 className="download-section-title">Install</h2>
          <ol className="download-steps">
            <li>Download the <code>.pkg</code> with the button above.</li>
            <li>
              Double-click to install. The pkg is signed and notarized, so
              Gatekeeper lets it through without right-click → Open.
            </li>
            <li>
              Open <code>Applications → BrowserBridge.app</code> once. The
              menu-bar icon appears and the bundled <code>opencli</code> shim
              is installed at <code>/usr/local/bin/opencli</code>.
            </li>
            <li>
              In a terminal, try <code>opencli --version</code>.
            </li>
          </ol>

          <h3 className="download-subsection-title">Verify the download</h3>
          <p className="download-prose">
            For paranoid installs (recommended in CI), compute the SHA-256 of
            the file you downloaded and compare it to the digest GitHub shows
            on the release asset:
          </p>
          <pre className="download-code">
{`shasum -a 256 ${info?.asset.name ?? FALLBACK.asset.name}`}
          </pre>

          <h3 className="download-subsection-title">System requirements</h3>
          <ul className="download-features">
            <li>macOS 13 (Ventura) or later, Apple Silicon (M-series)</li>
            <li>Google Chrome installed (the bridge connects to Chrome)</li>
            <li>~150 MB on disk for the bundled Node + OpenCLI runtime</li>
          </ul>

          <h3 className="download-subsection-title">Where to get help</h3>
          <ul className="download-features">
            <li>
              File issues on{' '}
              <a
                href="https://github.com/jackwener/OpenCLI-App/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                jackwener/OpenCLI-App
              </a>
              .
            </li>
            <li>
              Browse{' '}
              <a
                href="https://github.com/jackwener/OpenCLI-App/releases"
                target="_blank"
                rel="noopener noreferrer"
              >
                older releases
              </a>{' '}
              if you need to roll back.
            </li>
          </ul>
        </div>
      </section>
    </main>
  )
}
