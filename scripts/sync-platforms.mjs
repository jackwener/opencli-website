#!/usr/bin/env node
/**
 * sync-platforms.mjs
 *
 * Regenerates src/data/platforms.json from the OpenCLI repo's cli-manifest.json
 * so the landing-page platform table always matches the shipped adapters.
 *
 * Usage:
 *   node scripts/sync-platforms.mjs <path/to/cli-manifest.json>   # CI: _opencli/cli-manifest.json
 *   node scripts/sync-platforms.mjs                               # downloads manifest from GitHub
 *
 * Run before `npm run build` (deploy.yml runs it automatically).
 *
 * Display names, categories, and desktop-app entries are curated below.
 * Anything not found in the maps falls back to a title-cased name and the
 * 'utility' category, so new adapters show up on the site without edits.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUTPUT_PATH = path.join(ROOT, 'src/data/platforms.json')
const MANIFEST_URL =
  'https://raw.githubusercontent.com/jackwener/opencli/main/cli-manifest.json'

/* ── Curation: site slug → display name ─────────────────────────── */

const SITE_NAMES = {
  '12306': '12306',
  '1688': '1688',
  '1point3acres': '1Point3Acres',
  '36kr': '36Kr',
  '51job': '51Job',
  aibase: 'AIbase',
  amazon: 'Amazon',
  'apple-podcasts': 'Apple Podcasts',
  archive: 'Internet Archive',
  arxiv: 'ArXiv',
  autohome: 'Autohome',
  'baidu-scholar': 'Baidu Scholar',
  band: 'Band',
  barchart: 'Barchart',
  bbc: 'BBC',
  bilibili: 'Bilibili',
  binance: 'Binance',
  bloomberg: 'Bloomberg',
  bluesky: 'Bluesky',
  booking: 'Booking.com',
  boss: 'BOSS Zhipin',
  brave: 'Brave Search',
  chaoxing: 'Chaoxing',
  chatgpt: 'ChatGPT (web)',
  chess: 'Chess.com',
  claude: 'Claude',
  cnki: 'CNKI',
  coingecko: 'CoinGecko',
  confluence: 'Confluence',
  coupang: 'Coupang',
  crates: 'crates.io',
  ctrip: 'Ctrip',
  dblp: 'DBLP',
  deepseek: 'DeepSeek',
  defillama: 'DefiLlama',
  devto: 'Dev.to',
  dianping: 'Dianping',
  dictionary: 'Dictionary',
  dockerhub: 'Docker Hub',
  dongchedi: 'Dongchedi',
  douban: 'Douban',
  doubao: 'Doubao',
  douyin: 'Douyin',
  dribbble: 'Dribbble',
  duckduckgo: 'DuckDuckGo',
  eastmoney: 'Eastmoney',
  endoflife: 'endoflife.date',
  facebook: 'Facebook',
  flathub: 'Flathub',
  flomo: 'flomo',
  gemini: 'Gemini',
  geogebra: 'GeoGebra',
  gitee: 'Gitee',
  github: 'GitHub',
  'github-trending': 'GitHub Trending',
  gmail: 'Gmail',
  google: 'Google',
  'google-scholar': 'Google Scholar',
  goproxy: 'GoProxy',
  'gov-law': 'Gov Law',
  'gov-policy': 'Gov Policy',
  grok: 'Grok',
  guazi: 'Guazi',
  hackernews: 'Hacker News',
  hf: 'HuggingFace',
  hltv: 'HLTV',
  homebrew: 'Homebrew',
  huodongxing: 'Huodongxing',
  hupu: 'Hupu',
  imdb: 'IMDb',
  indeed: 'Indeed',
  instagram: 'Instagram',
  jd: 'JD.com',
  jianyu: 'Jianyu',
  jike: 'Jike',
  jimeng: 'Jimeng',
  jira: 'Jira',
  juejin: 'Juejin',
  ke: 'Beike',
  kimi: 'Kimi',
  lesswrong: 'LessWrong',
  lichess: 'Lichess',
  linkedin: 'LinkedIn',
  'linkedin-learning': 'LinkedIn Learning',
  'linux-do': 'Linux.do',
  lobsters: 'Lobsters',
  maimai: 'Maimai',
  manus: 'Manus',
  maven: 'Maven Central',
  mdn: 'MDN',
  medium: 'Medium',
  mercury: 'Mercury',
  midjourney: 'Midjourney',
  minimax: 'MiniMax',
  mubu: 'Mubu',
  notebooklm: 'NotebookLM',
  nowcoder: 'Nowcoder',
  npm: 'npm',
  nuget: 'NuGet',
  nvd: 'NVD',
  oeis: 'OEIS',
  ones: 'ONES',
  openalex: 'OpenAlex',
  openfda: 'openFDA',
  openreview: 'OpenReview',
  osv: 'OSV',
  packagist: 'Packagist',
  paperreview: 'PaperReview',
  pinterest: 'Pinterest',
  pixiv: 'Pixiv',
  powerchina: 'PowerChina',
  producthunt: 'Product Hunt',
  pubmed: 'PubMed',
  pypi: 'PyPI',
  quark: 'Quark',
  qwen: 'Qwen',
  reddit: 'Reddit',
  rednote: 'RedNote',
  'rest-countries': 'REST Countries',
  reuters: 'Reuters',
  rfc: 'RFC',
  rubygems: 'RubyGems',
  semanticscholar: 'Semantic Scholar',
  sinablog: 'Sina Blog',
  sinafinance: 'Sina Finance',
  slock: 'Slock',
  smzdm: 'SMZDM',
  spotify: 'Spotify',
  stackoverflow: 'StackOverflow',
  steam: 'Steam',
  substack: 'Substack',
  suno: 'Suno',
  taobao: 'Taobao',
  tdx: 'TDX',
  ths: 'THS',
  tieba: 'Baidu Tieba',
  tiktok: 'TikTok',
  toutiao: 'Toutiao',
  trip: 'Trip.com',
  tvmaze: 'TVmaze',
  twitter: 'Twitter / X',
  uisdc: 'UISDC',
  uiverse: 'Uiverse',
  upwork: 'Upwork',
  v2ex: 'V2EX',
  wanfang: 'Wanfang',
  web: 'Web (any page)',
  'wechat-channels': 'WeChat Channels',
  weibo: 'Weibo',
  weixin: 'WeChat',
  weread: 'WeRead',
  'weread-official': 'WeRead (official)',
  wikidata: 'Wikidata',
  wikipedia: 'Wikipedia',
  wttr: 'wttr.in',
  xianyu: 'Xianyu',
  xiaoe: 'Xiaoe',
  xiaohongshu: 'Xiaohongshu',
  xiaoyuzhou: 'Xiaoyuzhou',
  xueqiu: 'Xueqiu',
  yahoo: 'Yahoo',
  'yahoo-finance': 'Yahoo Finance',
  yollomi: 'Yollomi',
  youdao: 'Youdao',
  youtube: 'YouTube',
  yuanbao: 'Yuanbao',
  zhihu: 'Zhihu',
  zlibrary: 'Z-Library',
  zsxq: 'ZSXQ',
}

/* ── Curation: site slug → categories ────────────────────────────── */

const SITE_CATEGORIES = {
  // Social & media
  twitter: ['social'], reddit: ['social'], instagram: ['social'],
  facebook: ['social'], tiktok: ['social'], linkedin: ['social'],
  youtube: ['social'], pixiv: ['social'], steam: ['social'],
  bluesky: ['social'], dribbble: ['social'], pinterest: ['social'],
  spotify: ['social'], hltv: ['social'], band: ['social'],
  douyin: ['social', 'chinese'], rednote: ['social', 'chinese'],
  maimai: ['social', 'chinese'],

  // Chinese platforms (secondary category where it fits)
  '12306': ['chinese'], '1688': ['chinese'], '1point3acres': ['chinese'],
  '36kr': ['chinese'], '51job': ['chinese'], autohome: ['chinese'],
  'baidu-scholar': ['chinese'], cnki: ['chinese'], dianping: ['chinese'],
  dongchedi: ['chinese'], eastmoney: ['finance', 'chinese'],
  gitee: ['dev', 'chinese'], guazi: ['chinese'], huodongxing: ['chinese'],
  hupu: ['chinese'], jianyu: ['chinese'], juejin: ['chinese'],
  ke: ['chinese'], mubu: ['chinese'], nowcoder: ['chinese'],
  powerchina: ['chinese'], quark: ['chinese'], tdx: ['finance', 'chinese'],
  ths: ['finance', 'chinese'], toutiao: ['chinese'], wanfang: ['chinese'],
  'wechat-channels': ['chinese'], weixin: ['chinese'],
  'weread-official': ['chinese'], xiaoe: ['chinese'], xianyu: ['chinese'],
  youdao: ['chinese'], zsxq: ['chinese'], uisdc: ['chinese'],
  taobao: ['chinese'], douban: ['chinese'], v2ex: ['chinese'],
  boss: ['chinese'], chaoxing: ['chinese'], ctrip: ['chinese'],
  jd: ['chinese'], jike: ['chinese'], 'linux-do': ['chinese'],
  smzdm: ['chinese'], tieba: ['chinese'],
  weibo: ['chinese'], weread: ['chinese'], xiaohongshu: ['chinese'],
  xiaoyuzhou: ['chinese'], zhihu: ['chinese'], coupang: ['chinese'],
  sinablog: ['chinese'], sinafinance: ['finance', 'chinese'],
  xueqiu: ['finance', 'chinese'], doubao: ['ai', 'chinese'],
  jimeng: ['ai', 'chinese'], qwen: ['ai', 'chinese'],
  yuanbao: ['ai', 'chinese'],

  // Developer, research & news
  hackernews: ['dev'], github: ['dev'], 'github-trending': ['dev'],
  stackoverflow: ['dev'], devto: ['dev'], lobsters: ['dev'],
  medium: ['dev'], substack: ['dev'], arxiv: ['dev'], hf: ['dev'],
  wikipedia: ['dev'], wikidata: ['dev'], lesswrong: ['dev'], mdn: ['dev'],
  npm: ['dev'], pypi: ['dev'], crates: ['dev'], rubygems: ['dev'],
  packagist: ['dev'], nuget: ['dev'], maven: ['dev'], dockerhub: ['dev'],
  homebrew: ['dev'], goproxy: ['dev'], flathub: ['dev'], jira: ['dev'],
  confluence: ['dev'], ones: ['dev'], producthunt: ['dev'],
  uiverse: ['dev'], dblp: ['dev'], 'google-scholar': ['dev'],
  openalex: ['dev'], openreview: ['dev'], paperreview: ['dev'],
  semanticscholar: ['dev'], pubmed: ['dev'], oeis: ['dev'], rfc: ['dev'],
  osv: ['dev'], nvd: ['dev'], endoflife: ['dev'],

  // AI chat & agents (browser surface)
  claude: ['ai'], deepseek: ['ai'], gemini: ['ai'], kimi: ['ai'],
  chatgpt: ['ai'], grok: ['ai'], manus: ['ai'], minimax: ['ai'],
  notebooklm: ['ai'], midjourney: ['ai'], suno: ['ai'], aibase: ['ai'],
  slock: ['ai'], yollomi: ['ai'],

  // Finance
  bloomberg: ['finance'], barchart: ['finance'], 'yahoo-finance': ['finance'],
  binance: ['finance'], coingecko: ['finance'], defillama: ['finance'],
  mercury: ['finance'],

  // Utilities
  google: ['utility'], dictionary: ['utility'], 'apple-podcasts': ['utility'],
  brave: ['utility'], duckduckgo: ['utility'], yahoo: ['utility'],
  archive: ['utility'], booking: ['utility'], trip: ['utility'],
  imdb: ['utility'], tvmaze: ['utility'], wttr: ['utility'],
  geogebra: ['utility'], lichess: ['utility'], chess: ['utility'],
  indeed: ['utility'], upwork: ['utility'], 'linkedin-learning': ['utility'],
  gmail: ['utility'], zlibrary: ['utility'], web: ['utility'],
  'gov-law': ['utility'], 'gov-policy': ['utility'], openfda: ['utility'],
  'rest-countries': ['utility'],
}

/* ── Desktop apps: not in cli-manifest.json, curated here ────────── */

const DESKTOP_PLATFORMS = [
  { name: 'Discord', mode: 'desktop', category: ['social', 'desktop'], commands: ['status', 'send', 'read', 'channels', 'servers', 'search', 'members'] },
  { name: 'Cursor', mode: 'desktop', category: ['ai', 'desktop'], commands: ['status', 'send', 'read', 'new', 'composer', 'model', 'ask', 'screenshot'] },
  { name: 'Codex', mode: 'desktop', category: ['ai', 'desktop'], commands: ['status', 'send', 'read', 'new', 'extract-diff', 'model', 'ask', 'history'] },
  { name: 'ChatGPT', mode: 'desktop', category: ['ai', 'desktop'], commands: ['status', 'new', 'send', 'read', 'ask'] },
  { name: 'Notion', mode: 'desktop', category: ['ai', 'desktop'], commands: ['status', 'search', 'read', 'new', 'write', 'sidebar', 'favorites', 'export'] },
  { name: 'Doubao App', mode: 'desktop', category: ['ai', 'desktop', 'chinese'], commands: ['ask', 'new', 'read', 'send', 'screenshot', 'status'] },
  { name: 'ChatWise', mode: 'desktop', category: ['ai', 'desktop'], commands: ['ask', 'send', 'read', 'new', 'model', 'history', 'export', 'status'] },
]

/* ── Boilerplate session commands hidden from the showcase table ── */

const HIDDEN_COMMANDS = new Set(['login', 'whoami'])

/* ── Section ordering for the table ─────────────────────────────── */

const SECTION_ORDER = ['social', 'chinese', 'dev', 'ai', 'finance', 'utility', 'desktop']

function sectionOf(category) {
  for (const c of category) {
    const i = SECTION_ORDER.indexOf(c)
    if (i !== -1) return i
  }
  return SECTION_ORDER.length
}

function titleCase(slug) {
  return slug
    .split('-')
    .map((w) => (w.length <= 3 && w === w.toUpperCase() ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ')
}

async function loadManifest() {
  const arg = process.argv[2]
  if (arg) {
    return JSON.parse(fs.readFileSync(arg, 'utf8'))
  }
  console.log(`→ No manifest path given, downloading ${MANIFEST_URL}`)
  const res = await fetch(MANIFEST_URL)
  if (!res.ok) throw new Error(`Failed to download manifest: HTTP ${res.status}`)
  return res.json()
}

async function main() {
  const manifest = await loadManifest()

  // site slug → command list (deduped, boilerplate hidden, sorted)
  const sites = new Map()
  for (const cmd of manifest) {
    const site = cmd.site
    if (!site) continue
    if (!sites.has(site)) sites.set(site, { commands: new Set(), browser: cmd.browser !== false })
    const entry = sites.get(site)
    if (!HIDDEN_COMMANDS.has(cmd.name)) entry.commands.add(cmd.name)
    if (cmd.browser === false) entry.browser = false
  }

  const platforms = []
  for (const [slug, entry] of sites) {
    platforms.push({
      name: SITE_NAMES[slug] ?? titleCase(slug),
      mode: entry.browser ? 'browser' : 'public',
      category: SITE_CATEGORIES[slug] ?? ['utility'],
      commands: [...entry.commands].sort(),
    })
  }

  platforms.push(...DESKTOP_PLATFORMS)
  platforms.sort(
    (a, b) =>
      sectionOf(a.category) - sectionOf(b.category) || a.name.localeCompare(b.name),
  )

  const out = JSON.stringify(platforms, null, 2) + '\n'
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })
  fs.writeFileSync(OUTPUT_PATH, out)

  const byMode = platforms.reduce((acc, p) => {
    acc[p.mode] = (acc[p.mode] ?? 0) + 1
    return acc
  }, {})
  const totalCommands = platforms.reduce((n, p) => n + p.commands.length, 0)
  console.log(`✅ Wrote ${OUTPUT_PATH}`)
  console.log(`   ${platforms.length} platforms (${Object.entries(byMode).map(([m, n]) => `${n} ${m}`).join(', ')})`)
  console.log(`   ${totalCommands} showcased commands`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
