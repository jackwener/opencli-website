# Contributing a Plugin to OpenCLI

Want to get your OpenCLI plugin listed on [opencli.info/plugins](https://opencli.info/plugins)? Just open a Pull Request!

## How to Submit

### 1. Fork this repository

Fork [jackwener/opencli-website](https://github.com/jackwener/opencli-website) on GitHub.

### 2. Edit `src/data/plugins.json`

Add your plugin entry to the JSON array. Here's the format:

```json
{
  "name": "opencli-plugin-your-tool",
  "slug": "your-tool",
  "description": "Short description of what the plugin does",
  "author": "your-github-username",
  "repo": "your-github-username/opencli-plugin-your-tool",
  "type": "YAML",
  "category": "dev",
  "commands": ["command1", "command2"],
  "tags": ["tag1", "tag2"],
  "installCommand": "opencli plugin install github:your-github-username/opencli-plugin-your-tool"
}
```

### 3. Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ | Full plugin package name (must start with `opencli-plugin-`) |
| `slug` | ✅ | Short URL-safe identifier (used in the URL `/plugins/<slug>`) |
| `description` | ✅ | One-line description of what the plugin does |
| `author` | ✅ | Your GitHub username |
| `repo` | ✅ | GitHub repository in `owner/repo` format |
| `type` | ✅ | Plugin type: `YAML` or `TS` |
| `category` | ✅ | One of: `dev`, `social`, `chinese`, `utility` |
| `commands` | ✅ | Array of command names the plugin provides |
| `tags` | ✅ | Array of relevant tags for search discoverability |
| `installCommand` | ✅ | The exact install command users should run |

### 4. Open a Pull Request

- Make sure your plugin repository is **public** on GitHub.
- Include a **README.md** in your plugin repo — it will be rendered on the plugin detail page.
- Submit your PR against the `main` branch.

## What Happens After Merge

Once your PR is reviewed and merged:

1. The CI/CD pipeline automatically runs
2. GitHub metadata (stars, forks, description, README) is fetched from your repo
3. The website is rebuilt and deployed
4. Your plugin appears on [opencli.info/plugins](https://opencli.info/plugins) 🎉

## Guidelines

- **Plugin name** must follow the `opencli-plugin-*` naming convention.
- **Description** should be concise and clear (1 sentence).
- **README** should include install instructions and usage examples.
- Plugins must be **functional** and **installable** via `opencli plugin install`.
- No duplicate entries — check existing plugins before submitting.

## Updating Your Plugin

If you need to update your plugin's metadata (description, commands, tags, etc.):

1. Edit your entry in `src/data/plugins.json`
2. Submit a new PR

Note: GitHub metadata (stars, forks, README content) updates automatically on each deploy — you don't need to submit a PR for those.

## Questions?

- Open an [issue](https://github.com/jackwener/opencli-website/issues) if you have questions.
- See the [Plugins Guide](https://github.com/jackwener/opencli/blob/main/docs/guide/plugins.md) for how to create an OpenCLI plugin.
