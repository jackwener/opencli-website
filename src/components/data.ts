export type Category = 'all' | 'social' | 'chinese' | 'dev' | 'ai' | 'finance' | 'desktop' | 'utility'
export type Platform = { name: string; mode: string; category: Category[]; commands: string[] }

// The PLATFORMS table is generated from the OpenCLI repo's cli-manifest.json
// by `node scripts/sync-platforms.mjs` (run automatically in deploy.yml).
// Display names, categories, and desktop-app entries are curated in the script.
import platformsData from '../data/platforms.json'

export const PLATFORMS: Platform[] = platformsData as Platform[]

export const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All',
  social: 'Social',
  chinese: 'Chinese Platforms',
  dev: 'Dev & News',
  ai: 'AI & Desktop',
  finance: 'Finance',
  desktop: 'Desktop Apps',
  utility: 'Utilities',
}

export const FILTER_CATEGORIES: Category[] = ['all', 'social', 'chinese', 'dev', 'ai', 'finance', 'utility', 'desktop']

export const FEATURES = [
  {
    icon: '🛡️',
    title: 'Account Safe',
    desc: 'Reuses Chrome\'s logged-in state. Your credentials never leave the browser — zero security risk.',
  },
  {
    icon: '🤖',
    title: 'AI Agent Ready',
    desc: 'Navigate, inspect page state, click, fill forms, extract, and screenshot with opencli browser. No site adapter required.',
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
    title: 'Reusable Site Commands',
    desc: 'Use built-in adapters for recurring tasks, or package a browser workflow as a command with the adapter-author skill.',
  },
  {
    icon: '🪝',
    title: 'Lifecycle Hooks',
    desc: 'Hook into command execution with pre/post events. Build audit logs, diff tracking, or Slack notifications.',
  },
]
