import ParticleBackground from './ParticleBackground'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { Platforms } from './components/Platforms'
import { HowItWorks } from './components/HowItWorks'
import { CTA, Footer } from './components/CTA'

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
