import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useFadeIn } from '../components/useFadeIn'
import { blogPosts, loadPostContent } from '../data/blog'

type Lang = 'zh' | 'en'

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const lang = (searchParams.get('lang') as Lang) || 'en'
  const headerRef = useFadeIn()
  const contentRef = useFadeIn()

  const [markdown, setMarkdown] = useState('')

  const post = useMemo(() => blogPosts.find(p => p.slug === slug), [slug])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug, lang])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    loadPostContent(slug, lang).then(md => {
      if (!cancelled) setMarkdown(md)
    })
    return () => { cancelled = true }
  }, [slug, lang])

  const html = useMemo(() => {
    if (!markdown) return ''
    const raw = marked.parse(markdown) as string
    return DOMPurify.sanitize(raw, {
      ADD_TAGS: ['img'],
      ADD_ATTR: ['target', 'rel'],
    })
  }, [markdown])

  const setLang = (l: Lang) => {
    setSearchParams({ lang: l })
  }

  if (!post) {
    return (
      <div className="blog-post-page">
        <div className="container">
          <div className="plugin-not-found">
            <h2>Post not found</h2>
            <p>The article "{slug}" doesn't exist.</p>
            <Link to="/blog" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-post-page">
      <div className="container">
        {/* Back nav */}
        <Link to="/blog" className="plugin-detail-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {lang === 'zh' ? '返回博客' : 'Back to Blog'}
        </Link>

        {/* Header */}
        <div className="blog-post-header fade-in" ref={headerRef}>
          <div className="blog-post-meta">
            <time>{post.date}</time>
            <span>{post.author}</span>
            <div className="blog-card-tags">
              {post.tags.map(t => (
                <span key={t} className="blog-tag">{t}</span>
              ))}
            </div>
          </div>
          <h1 className="blog-post-title">{post.title[lang]}</h1>
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

        {/* Content */}
        <div className="blog-post-content fade-in" ref={contentRef}>
          <div
            className="blog-prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  )
}
