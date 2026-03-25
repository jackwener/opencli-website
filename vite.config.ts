import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Dynamically read version from the main opencli project
// In CI/CD, deploy.yml sets VITE_OPENCLI_VERSION explicitly. For local dev, we read ../opencli/package.json
let opencliVersion = process.env.VITE_OPENCLI_VERSION
if (!opencliVersion) {
  try {
    const pkgPath = path.resolve(__dirname, '../opencli/package.json')
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      opencliVersion = pkg.version
    }
  } catch (e) {
    console.warn('Could not read opencli version locally.')
  }
}

// Fallback if both fail
opencliVersion = opencliVersion || '1.0'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  define: {
    'import.meta.env.VITE_OPENCLI_VERSION': JSON.stringify(opencliVersion)
  }
})
