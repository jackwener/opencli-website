#!/usr/bin/env node
/**
 * fetch-plugin-stars.mjs
 *
 * Reads src/data/plugins.json, fetches GitHub metadata (stars, forks, description,
 * updated_at, README) for each plugin, and writes the enriched data to
 * src/data/plugins-enriched.json.
 *
 * Run before build:  node scripts/fetch-plugin-stars.mjs
 * In CI, set GITHUB_TOKEN env var for higher rate limits (5000 req/hr).
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PLUGINS_PATH = path.join(ROOT, 'src/data/plugins.json')
const OUTPUT_PATH = path.join(ROOT, 'src/data/plugins-enriched.json')

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''

async function githubFetch(url) {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'opencli-website-builder',
  }
  if (GITHUB_TOKEN) {
    headers.Authorization = `token ${GITHUB_TOKEN}`
  }
  const res = await fetch(url, { headers })
  if (!res.ok) {
    console.warn(`⚠ GitHub API ${res.status} for ${url}`)
    return null
  }
  return res.json()
}

async function fetchReadme(repo) {
  // Try to get README content via GitHub API
  const data = await githubFetch(`https://api.github.com/repos/${repo}/readme`)
  if (!data || !data.content) return ''
  // GitHub returns base64-encoded content
  const buf = Buffer.from(data.content, 'base64')
  return buf.toString('utf-8')
}

async function enrichPlugin(plugin) {
  console.log(`  → Fetching metadata for ${plugin.repo}...`)

  const repoData = await githubFetch(`https://api.github.com/repos/${plugin.repo}`)

  const enriched = { ...plugin }

  if (repoData) {
    enriched.stars = repoData.stargazers_count ?? 0
    enriched.forks = repoData.forks_count ?? 0
    enriched.githubDescription = repoData.description ?? ''
    enriched.updatedAt = repoData.updated_at ?? ''
    enriched.createdAt = repoData.created_at ?? ''
    enriched.homepage = repoData.homepage ?? ''
    enriched.language = repoData.language ?? ''
    enriched.license = repoData.license?.spdx_id ?? ''
    enriched.openIssues = repoData.open_issues_count ?? 0
    enriched.defaultBranch = repoData.default_branch ?? 'main'
  } else {
    enriched.stars = 0
    enriched.forks = 0
    enriched.githubDescription = ''
    enriched.updatedAt = ''
    enriched.createdAt = ''
    enriched.homepage = ''
    enriched.language = ''
    enriched.license = ''
    enriched.openIssues = 0
    enriched.defaultBranch = 'main'
  }

  // Fetch README
  const readme = await fetchReadme(plugin.repo)
  enriched.readme = readme

  return enriched
}

async function main() {
  console.log('🔌 Fetching plugin metadata from GitHub...\n')

  if (!fs.existsSync(PLUGINS_PATH)) {
    console.error(`❌ plugins.json not found at ${PLUGINS_PATH}`)
    process.exit(1)
  }

  const plugins = JSON.parse(fs.readFileSync(PLUGINS_PATH, 'utf-8'))
  console.log(`Found ${plugins.length} plugins\n`)

  const enriched = []
  for (const plugin of plugins) {
    try {
      const result = await enrichPlugin(plugin)
      enriched.push(result)
    } catch (err) {
      console.warn(`⚠ Failed to enrich ${plugin.name}: ${err.message}`)
      enriched.push({
        ...plugin,
        stars: 0,
        forks: 0,
        githubDescription: '',
        updatedAt: '',
        createdAt: '',
        homepage: '',
        language: '',
        license: '',
        openIssues: 0,
        defaultBranch: 'main',
        readme: '',
      })
    }
  }

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT_PATH)
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(enriched, null, 2))
  console.log(`\n✅ Wrote enriched data to ${OUTPUT_PATH}`)
  console.log(`   ${enriched.length} plugins processed`)

  // Summary
  const totalStars = enriched.reduce((sum, p) => sum + p.stars, 0)
  console.log(`   Total stars: ${totalStars}`)
}

main().catch((err) => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
