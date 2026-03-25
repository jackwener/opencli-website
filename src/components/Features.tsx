import { useEffect, useRef } from 'react'
import { useFadeIn } from './useFadeIn'
import { FEATURES } from './data'

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

export function Features() {
  const ref = useFadeIn()
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="features-header fade-in" ref={ref}>
          <span className="section-label">Features</span>
          <h2 className="section-title">Built for power users<br />&amp; AI agents alike</h2>
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
