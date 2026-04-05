import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFadeIn } from '../components/useFadeIn'
import { blogPosts } from '../data/blog'
import type { BlogPost } from '../data/blog'

type Lang = 'zh' | 'en'

function BlogCard({ post, lang }: { post: BlogPost; lang: Lang }) {
  const ref = useFadeIn()
  return (
    <div ref={ref} className="fade-in">
      <Link to={`/blog/${post.slug}?lang=${lang}`} className="blog-card">
        <div className="blog-card-meta">
          <time className="blog-card-date">{post.date}</time>
          <span className="blog-card-author">{post.author}</span>
        </div>
        <h2 className="blog-card-title">{post.title[lang]}</h2>
        <p className="blog-card-desc">{post.description[lang]}</p>
        <div className="blog-card-tags">
          {post.tags.map(t => (
            <span key={t} className="blog-tag">{t}</span>
          ))}
        </div>
        <span className="blog-card-read">
          {lang === 'zh' ? '阅读全文 →' : 'Read more →'}
        </span>
      </Link>
    </div>
  )
}

export function BlogPage() {
  const [lang, setLang] = useState<Lang>('en')
  const heroRef = useFadeIn()

  return (
    <div className="blog-page">
      <div className="container">
        {/* Hero */}
        <div className="blog-hero">
          <div className="plugins-hero-glow" />
          <h1 className="blog-hero-title fade-in" ref={heroRef}>
            {lang === 'zh' ? '博客 & 文章' : 'Blog & Articles'}
          </h1>
          <p className="blog-hero-desc">
            {lang === 'zh'
              ? '深入了解 OpenCLI 的设计哲学、技术架构与使用场景'
              : 'Deep dives into OpenCLI design philosophy, architecture, and use cases'}
          </p>
          {/* Language toggle */}
          <div className="blog-lang-toggle">
            <button
              className={`blog-lang-btn${lang === 'en' ? ' active' : ''}`}
              onClick={() => setLang('en')}
            >
              English
            </button>
            <button
              className={`blog-lang-btn${lang === 'zh' ? ' active' : ''}`}
              onClick={() => setLang('zh')}
            >
              中文
            </button>
          </div>
        </div>

        {/* Post list */}
        <div className="blog-list">
          {blogPosts.map(post => (
            <BlogCard key={post.slug} post={post} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  )
}
