# OpenCLI Website

Official landing page for [OpenCLI](https://github.com/jackwener/opencli) — deployed at [opencli.info](https://opencli.info).

## Tech Stack

- **React 19** + **TypeScript** — UI components
- **Vite 8** — Build tooling & dev server
- **Three.js** / **React Three Fiber** — 3D particle background
- **Vanilla CSS** — Design system with custom tokens (no Tailwind)
- **GitHub Actions** — Automated build & deploy to GitHub Pages

## Architecture

```
src/
├── App.tsx                 # All page sections (Nav, Hero, Features, Platforms, HowItWorks, CTA, Footer)
├── ParticleBackground.tsx  # WebGL 3D scene: floating particles, connection lines, wireframe shapes, mouse parallax
├── index.css               # Complete design system — tokens, components, responsive, animations
└── main.tsx                # React entry point

public/
├── CNAME                   # Custom domain (opencli.info)
├── favicon.svg
└── icons.svg
```

### Key Modules

**`App.tsx`** — Single-file page layout with:
- Platform data (30+ integrations with available commands)
- Feature cards with staggered intersection-observer animations
- Interactive terminal preview demonstrating CLI usage
- Smooth scroll navigation

**`ParticleBackground.tsx`** — Full-viewport WebGL scene built with React Three Fiber:
- 1200 floating particles with drift physics and boundary wrapping
- Dynamic connection lines between nearby particles (distance-based)
- Wireframe torus knot and icosahedron decorations
- Mouse-driven parallax camera rig
- Additive blending + fog for depth

**`index.css`** — Design system featuring:
- Tech noir palette (`#0a0a0f` base, `#00e5a0` accent, `#00b4d8` blue, `#7b61ff` purple)
- Typography: Outfit (display), Plus Jakarta Sans (body), JetBrains Mono (code)
- Glassmorphism cards with backdrop-filter
- Fade-in-up entrance animations via IntersectionObserver

## Development

```bash
npm install
npm run dev       # Start dev server at localhost:5173
npm run build     # Production build → dist/
npm run preview   # Preview production build
```

## Deployment

The site is automatically deployed to GitHub Pages when pushing to `master`/`main`.

The deploy workflow also **cross-builds VitePress docs** from the [opencli](https://github.com/jackwener/opencli) repo, merging them into `dist/docs/` so documentation is served at `opencli.info/docs/`.

Deployment is also triggered via `repository_dispatch` when the opencli repo's `docs/` directory is updated.

```
opencli.info/         → This website (landing page)
opencli.info/docs/    → VitePress documentation (built from opencli repo)
```

## License

Apache-2.0 — see [opencli](https://github.com/jackwener/opencli) for details.
