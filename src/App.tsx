import { Routes, Route } from 'react-router-dom'
import ParticleBackground from './ParticleBackground'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { Platforms } from './components/Platforms'
import { HowItWorks } from './components/HowItWorks'
import { CTA, Footer } from './components/CTA'
import { PluginsPage } from './pages/PluginsPage'
import { PluginDetailPage } from './pages/PluginDetailPage'
import { BlogPage } from './pages/BlogPage'
import { BlogPostPage } from './pages/BlogPostPage'

function HomePage() {
  return (
    <>
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

export default function App() {
  return (
    <>
      <ParticleBackground />
      <div className="noise-overlay" />
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/plugins" element={<PluginsPage />} />
        <Route path="/plugins/:slug" element={<PluginDetailPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
      </Routes>
    </>
  )
}
