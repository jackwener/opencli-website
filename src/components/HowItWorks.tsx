import { useEffect, useRef } from 'react'
import { useFadeIn } from './useFadeIn'

function StepCard({ num, title, desc, code, delay }: { num: string; title: string; desc: string; code: string | null; delay: number }) {
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
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div className="step fade-in" ref={ref}>
      <div className="step-number">{num}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      {code && <span className="step-code">{code}</span>}
    </div>
  )
}

function Steps() {
  const steps = [
    { num: '01', title: 'Install', desc: 'One npm command. Works globally, instantly.', code: 'npm i -g @jackwener/opencli' },
    { num: '02', title: 'Bridge', desc: 'Load the Browser Bridge extension in Chrome. Auto-connects with zero config.', code: 'opencli setup' },
    { num: '03', title: 'Login', desc: 'Just browse normally. OpenCLI reuses your existing logged-in sessions.', code: null },
    { num: '04', title: 'Command', desc: 'Run any supported command. Data flows from your browser to your terminal.', code: 'opencli bilibili hot' },
  ]

  return (
    <div className="steps">
      {steps.map((s, i) => (
        <StepCard key={s.num} {...s} delay={i * 0.12} />
      ))}
    </div>
  )
}

export function HowItWorks() {
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
