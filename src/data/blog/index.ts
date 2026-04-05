export interface BlogPost {
  slug: string
  title: { zh: string; en: string }
  description: { zh: string; en: string }
  date: string
  author: string
  tags: string[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'opencli-emacs-for-agents',
    title: {
      zh: 'OpenCLI：AI Agent 的 Emacs',
      en: 'OpenCLI: The Emacs for AI Agents',
    },
    description: {
      zh: '当我们谈论 Emacs 时，我们谈论的不是一个编辑器，而是一个可编程的环境。OpenCLI 正在为 AI Agent 做同样的事。',
      en: "When we talk about Emacs, we're not talking about an editor — we're talking about a programmable environment. OpenCLI is doing the same thing for AI agents.",
    },
    date: '2026-04-05',
    author: 'OpenCLI Team',
    tags: ['design-philosophy', 'emacs', 'ai-agent'],
  },
]

// Lazy-load markdown content
export async function loadPostContent(slug: string, lang: 'zh' | 'en'): Promise<string> {
  const modules = import.meta.glob('./*.md', { query: '?raw', import: 'default' })
  const key = `./${slug}.${lang}.md`
  const loader = modules[key]
  if (!loader) return ''
  return (await loader()) as string
}
