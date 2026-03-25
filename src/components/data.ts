export type Category = 'all' | 'social' | 'chinese' | 'dev' | 'ai' | 'finance' | 'desktop' | 'utility'

export const PLATFORMS: { name: string; mode: string; category: Category[]; commands: string[] }[] = [
  // Social & Media
  { name: 'Twitter / X', mode: 'browser', category: ['social'], commands: ['trending', 'timeline', 'bookmarks', 'search', 'profile', 'post', 'reply', 'like', 'follow', 'download'] },
  { name: 'Reddit', mode: 'browser', category: ['social'], commands: ['hot', 'frontpage', 'popular', 'search', 'subreddit', 'read', 'comment', 'save', 'upvote'] },
  { name: 'Instagram', mode: 'browser', category: ['social'], commands: ['explore', 'search', 'profile', 'follow', 'like', 'comment', 'save', 'user'] },
  { name: 'Facebook', mode: 'browser', category: ['social'], commands: ['feed', 'search', 'profile', 'friends', 'groups', 'events', 'notifications'] },
  { name: 'TikTok', mode: 'browser', category: ['social'], commands: ['explore', 'search', 'profile', 'follow', 'like', 'comment', 'save', 'user'] },
  { name: 'LinkedIn', mode: 'browser', category: ['social'], commands: ['search', 'timeline'] },
  { name: 'YouTube', mode: 'browser', category: ['social'], commands: ['search', 'video', 'transcript'] },
  { name: 'Discord', mode: 'desktop', category: ['social', 'desktop'], commands: ['status', 'send', 'read', 'channels', 'servers', 'search', 'members'] },
  { name: 'Pixiv', mode: 'browser', category: ['social'], commands: ['ranking', 'search', 'detail', 'download', 'user'] },
  { name: 'Steam', mode: 'browser', category: ['social'], commands: ['top-sellers'] },

  // Chinese Social & Content
  { name: 'Bilibili', mode: 'browser', category: ['chinese'], commands: ['hot', 'ranking', 'search', 'feed', 'favorite', 'history', 'subtitle', 'download'] },
  { name: '小红书', mode: 'browser', category: ['chinese'], commands: ['search', 'feed', 'user', 'notifications', 'download', 'publish'] },
  { name: '微博', mode: 'browser', category: ['chinese'], commands: ['hot', 'search'] },
  { name: '知乎', mode: 'browser', category: ['chinese'], commands: ['hot', 'search', 'question', 'download'] },
  { name: '豆瓣', mode: 'browser', category: ['chinese'], commands: ['movie-hot', 'book-hot', 'top250', 'search', 'subject', 'reviews'] },
  { name: 'V2EX', mode: 'browser', category: ['chinese'], commands: ['hot', 'latest', 'daily', 'topic', 'node', 'me'] },
  { name: '即刻', mode: 'browser', category: ['chinese'], commands: ['feed', 'search', 'topic', 'post', 'comment', 'like', 'user'] },
  { name: 'Linux.do', mode: 'browser', category: ['chinese'], commands: ['hot', 'latest', 'search', 'category', 'topic'] },
  { name: 'BOSS直聘', mode: 'browser', category: ['chinese'], commands: ['search', 'recommend', 'joblist', 'chatlist', 'greet'] },
  { name: '微信读书', mode: 'browser', category: ['chinese'], commands: ['search', 'shelf', 'ranking', 'book', 'notes', 'highlights'] },
  { name: '小宇宙', mode: 'browser', category: ['chinese'], commands: ['episode', 'podcast', 'podcast-episodes'] },
  { name: '超星', mode: 'browser', category: ['chinese'], commands: ['assignments', 'exams'] },
  { name: '什么值得买', mode: 'browser', category: ['chinese'], commands: ['search'] },
  { name: '携程', mode: 'browser', category: ['chinese'], commands: ['search'] },
  { name: '京东', mode: 'browser', category: ['chinese'], commands: ['item'] },
  { name: 'Coupang', mode: 'browser', category: ['chinese'], commands: ['search', 'add-to-cart'] },

  // Developer & News
  { name: 'Hacker News', mode: 'public', category: ['dev'], commands: ['top', 'best', 'new', 'ask', 'show', 'jobs', 'search', 'user'] },
  { name: 'GitHub', mode: 'public', category: ['dev'], commands: ['search'] },
  { name: 'StackOverflow', mode: 'browser', category: ['dev'], commands: ['hot', 'search', 'bounties', 'unanswered'] },
  { name: 'Dev.to', mode: 'browser', category: ['dev'], commands: ['top', 'tag', 'user'] },
  { name: 'Lobsters', mode: 'public', category: ['dev'], commands: ['hot', 'active', 'newest', 'tag'] },
  { name: 'Medium', mode: 'browser', category: ['dev'], commands: ['feed', 'search', 'user'] },
  { name: 'Substack', mode: 'browser', category: ['dev'], commands: ['feed', 'search', 'publication'] },
  { name: 'ArXiv', mode: 'public', category: ['dev'], commands: ['search', 'paper'] },
  { name: 'HuggingFace', mode: 'public', category: ['dev'], commands: ['top'] },
  { name: 'Wikipedia', mode: 'public', category: ['dev'], commands: ['search', 'summary', 'random', 'trending'] },

  // AI & Desktop Apps
  { name: 'Cursor', mode: 'desktop', category: ['ai', 'desktop'], commands: ['status', 'send', 'read', 'new', 'composer', 'model', 'ask', 'screenshot'] },
  { name: 'Codex', mode: 'desktop', category: ['ai', 'desktop'], commands: ['status', 'send', 'read', 'new', 'extract-diff', 'model', 'ask', 'history'] },
  { name: 'ChatGPT', mode: 'desktop', category: ['ai', 'desktop'], commands: ['status', 'new', 'send', 'read', 'ask'] },
  { name: 'Notion', mode: 'desktop', category: ['ai', 'desktop'], commands: ['status', 'search', 'read', 'new', 'write', 'sidebar', 'favorites', 'export'] },
  { name: 'Grok', mode: 'browser', category: ['ai'], commands: ['ask'] },
  { name: '豆包', mode: 'browser', category: ['ai', 'chinese'], commands: ['ask', 'new', 'read', 'send', 'status'] },
  { name: '豆包 App', mode: 'desktop', category: ['ai', 'desktop', 'chinese'], commands: ['ask', 'new', 'read', 'send', 'screenshot', 'status'] },
  { name: 'ChatWise', mode: 'desktop', category: ['ai', 'desktop'], commands: ['ask', 'send', 'read', 'new', 'model', 'history', 'export', 'status'] },
  { name: '即梦', mode: 'browser', category: ['ai', 'chinese'], commands: ['generate', 'history'] },
  { name: 'Yollomi', mode: 'browser', category: ['ai'], commands: ['generate', 'face-swap', 'remove-bg', 'restore', 'upscale', 'try-on'] },

  // Finance & News
  { name: 'Bloomberg', mode: 'browser', category: ['finance'], commands: ['main', 'markets', 'economics', 'tech', 'politics', 'news'] },
  { name: '雪球', mode: 'browser', category: ['finance', 'chinese'], commands: ['hot', 'hot-stock', 'stock', 'search', 'feed', 'watchlist', 'earnings-date'] },
  { name: 'Yahoo Finance', mode: 'browser', category: ['finance'], commands: ['quote'] },
  { name: '新浪财经', mode: 'browser', category: ['finance', 'chinese'], commands: ['news'] },
  { name: 'Barchart', mode: 'browser', category: ['finance'], commands: ['quote', 'options', 'greeks', 'flow'] },
  { name: 'BBC', mode: 'public', category: ['finance'], commands: ['news'] },
  { name: 'Reuters', mode: 'browser', category: ['finance'], commands: ['search'] },
  { name: 'Google', mode: 'browser', category: ['utility'], commands: ['search', 'news', 'suggest', 'trends'] },

  // Utilities
  { name: 'Apple Podcasts', mode: 'browser', category: ['utility'], commands: ['search', 'top', 'episodes'] },
  { name: 'Dictionary', mode: 'public', category: ['utility'], commands: ['search', 'synonyms', 'examples'] },
  { name: '新浪博客', mode: 'browser', category: ['chinese'], commands: ['hot', 'search', 'article', 'user'] },
  { name: '微信', mode: 'browser', category: ['chinese'], commands: ['download'] },
]

export const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All',
  social: 'Social',
  chinese: '中文平台',
  dev: 'Dev & News',
  ai: 'AI & Desktop',
  finance: 'Finance',
  desktop: 'Desktop Apps',
  utility: 'Utilities',
}

export const FILTER_CATEGORIES: Category[] = ['all', 'social', 'chinese', 'dev', 'ai', 'finance', 'utility']

export const FEATURES = [
  {
    icon: '🛡️',
    title: 'Account Safe',
    desc: 'Reuses Chrome\'s logged-in state. Your credentials never leave the browser — zero security risk.',
  },
  {
    icon: '🤖',
    title: 'AI Agent Ready',
    desc: 'Built-in explore, synthesize, and cascade commands. AI discovers APIs and generates adapters automatically.',
  },
  {
    icon: '🖥️',
    title: 'Desktop Apps Too',
    desc: 'CLI-ify Electron apps like Cursor, Codex, ChatGPT, Notion, Discord — AI can now control itself natively.',
  },
  {
    icon: '⚡',
    title: 'Dual Engine',
    desc: 'YAML declarative pipelines for simple flows. TypeScript adapters for robust browser runtime injection.',
  },
  {
    icon: '🔄',
    title: 'Self-Healing',
    desc: 'Built-in setup wizard and doctor command. Auto-diagnoses daemon, extension, and browser connectivity.',
  },
  {
    icon: '📦',
    title: 'Dynamic Loader',
    desc: 'Drop .ts or .yaml adapters into the clis/ folder — auto-registered, zero config. Extend in seconds.',
  },
  {
    icon: '🧩',
    title: 'Plugin System',
    desc: 'Install, manage, and publish plugins with integrity validation. Extend OpenCLI with community-built adapters.',
  },
  {
    icon: '🎬',
    title: 'Record & Replay',
    desc: 'Record browser sessions and replay them as CLI commands. Perfect for debugging and creating new adapters.',
  },
  {
    icon: '🪝',
    title: 'Lifecycle Hooks',
    desc: 'Hook into command execution with pre/post events. Build audit logs, diff tracking, or Slack notifications.',
  },
]
