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

interface PlatformDownload {
  label: string
  detail: string
  warning?: string
  asset: ReleaseAsset
}

interface DownloadInfo {
  version: string
  releaseUrl: string
  publishedAt: string
  mac: PlatformDownload | null
  windows: PlatformDownload | null
}

/* ─── Constants ─── */

// Fallback used if the GitHub API is unreachable (offline preview, rate
// limited, network blocked). Update on each App release.
const FALLBACK: DownloadInfo = {
  version: '0.1.30',
  releaseUrl: 'https://github.com/jackwener/opencli-website/releases/tag/app-v0.1.30',
  publishedAt: '',
  mac: {
    label: 'macOS',
    detail: 'Apple Silicon · signed and notarized .pkg',
    asset: {
      name: 'OpenCLIApp_0.1.30_aarch64.pkg',
      size: 88_103_145,
      browser_download_url:
        'https://github.com/jackwener/opencli-website/releases/download/app-v0.1.30/OpenCLIApp_0.1.30_aarch64.pkg',
      digest: null,
    },
  },
  windows: {
    label: 'Windows',
    detail: 'x64 · unsigned NSIS installer',
    warning: 'Unsigned preview: Windows SmartScreen may require More info -> Run anyway.',
    asset: {
      name: 'OpenCLIApp_0.1.30_x64-setup.exe',
      size: 31_838_016,
      browser_download_url:
        'https://github.com/jackwener/opencli-website/releases/download/app-v0.1.30/OpenCLIApp_0.1.30_x64-setup.exe',
      digest: null,
    },
  },
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
 * Apple-Silicon OpenCLIApp pattern, falls back to the first `.pkg` asset.
 */
function pickPkgAsset(assets: ReleaseAsset[]): ReleaseAsset | null {
  const pkgs = assets.filter((a) => a.name.toLowerCase().endsWith('.pkg'))
  if (pkgs.length === 0) return null
  // Prefer Apple Silicon / aarch64 builds.
  const arm = pkgs.find((a) => /aarch64|arm64/i.test(a.name))
  return arm ?? pkgs[0]
}

function pickWindowsAsset(assets: ReleaseAsset[]): ReleaseAsset | null {
  const installers = assets.filter((a) => a.name.toLowerCase().endsWith('.exe'))
  if (installers.length === 0) return null
  const x64Setup = installers.find((a) => /x64.*setup|setup.*x64/i.test(a.name))
  return x64Setup ?? installers[0]
}

function compareVersionDesc(a: string, b: string): number {
  const pa = a.split('.').map((part) => Number.parseInt(part, 10) || 0)
  const pb = b.split('.').map((part) => Number.parseInt(part, 10) || 0)
  const len = Math.max(pa.length, pb.length, 3)
  for (let i = 0; i < len; i += 1) {
    const diff = (pb[i] ?? 0) - (pa[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

async function fetchLatestDownload(): Promise<DownloadInfo | null> {
  const res = await fetch(RELEASES_API, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) return null
  const releases = (await res.json()) as Release[]
  // Only consider non-draft releases tagged with `app-v*` so any future
  // website-only release tag (e.g. a site redesign) doesn't accidentally
  // become the "App download" surfaced here. Most recent first.
  const candidates = releases
    .filter((r) => !r.draft && r.tag_name.startsWith(APP_TAG_PREFIX))
    .sort((a, b) =>
      compareVersionDesc(
        a.tag_name.slice(APP_TAG_PREFIX.length),
        b.tag_name.slice(APP_TAG_PREFIX.length),
      ),
    )
  for (const release of candidates) {
    const macAsset = pickPkgAsset(release.assets)
    const windowsAsset = pickWindowsAsset(release.assets)
    if (!macAsset && !windowsAsset) continue
    return {
      version: release.tag_name.slice(APP_TAG_PREFIX.length) || release.name,
      releaseUrl: release.html_url,
      publishedAt: release.published_at,
      mac: macAsset
        ? {
            label: 'macOS',
            detail: 'Apple Silicon · signed and notarized .pkg',
            asset: macAsset,
          }
        : null,
      windows: windowsAsset
        ? {
            label: 'Windows',
            detail: 'x64 · unsigned NSIS installer',
            warning: 'Unsigned preview: Windows SmartScreen may require More info -> Run anyway.',
            asset: windowsAsset,
          }
        : null,
    }
  }
  return null
}

function PlatformDownloadCard({ download }: { download: PlatformDownload }) {
  return (
    <div className="download-platform-card">
      <div className="download-platform-head">
        <div>
          <div className="download-platform-label">{download.label}</div>
          <div className="download-platform-detail">{download.detail}</div>
        </div>
        <div className="download-platform-size">{formatBytes(download.asset.size)}</div>
      </div>

      <a
        href={download.asset.browser_download_url}
        className="download-primary-button"
        download
      >
        <span className="download-primary-icon">↓</span>
        Download for {download.label}
      </a>

      {download.warning && <div className="download-warning">{download.warning}</div>}
    </div>
  )
}

/* ─── Component ─── */

export function DownloadPage() {
  const fadeIn = useFadeIn()
  const [info, setInfo] = useState<DownloadInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchLatestDownload()
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
            Download <span className="download-product">OpenCLIApp</span>
          </h1>
          <p className="download-subtitle">
            The menu-bar companion app that lets <code>opencli</code> drive your
            already-signed-in browser sessions, without juggling profiles or
            shells. Available for macOS and Windows.
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
                  <div className="download-arch-chip">macOS + Windows</div>
                </div>

                <div className="download-platform-grid">
                  {info.mac && <PlatformDownloadCard download={info.mac} />}
                  {info.windows && <PlatformDownloadCard download={info.windows} />}
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
            <li>Download the macOS <code>.pkg</code> or Windows <code>.exe</code> with the buttons above.</li>
            <li>
              On macOS, double-click to install. The pkg is signed and
              notarized, so Gatekeeper lets it through without right-click → Open.
            </li>
            <li>
              On Windows, run the setup exe. The current Windows build is
              unsigned, so SmartScreen may require <strong>More info</strong> →
              <strong> Run anyway</strong>.
            </li>
            <li>
              Open <code>Applications → OpenCLIApp.app</code> once. The
              menu-bar icon appears and the bundled <code>opencli</code> shim
              is installed at <code>/usr/local/bin/opencli</code>.
            </li>
            <li>
              In a terminal, try <code>opencli --version</code>.
            </li>
          </ol>

          <h3 className="download-subsection-title">Release integrity</h3>
          <p className="download-prose">
            If you need to verify an installer manually, use the digest listed
            on the corresponding GitHub release asset:
          </p>
          <p className="download-prose">
            <a
              href={info?.releaseUrl ?? FALLBACK.releaseUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open the latest release on GitHub →
            </a>
          </p>

          <h3 className="download-subsection-title">System requirements</h3>
          <ul className="download-features">
            <li>macOS 13 (Ventura) or later, Apple Silicon (M-series)</li>
            <li>Windows 10/11 x64 with Microsoft Edge WebView2 runtime</li>
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
