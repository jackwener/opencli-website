# OpenCLI: The Emacs for AI Agents

> When we talk about Emacs, we're not talking about an editor — we're talking about a programmable environment. OpenCLI is doing the same thing for AI agents.

---

## Introduction: From "Giving Agents a Tool" to "Giving Agents an Environment"

The current AI agent ecosystem faces a fundamental tension: an agent's capabilities are strictly bounded by the tools it can call. Every new service integration demands a custom API wrapper, authentication handling, response parsing, and version maintenance — much like how, 40 years ago, every new task required switching to a purpose-built editor.

Emacs broke this fragmentation with a radical design philosophy: **everything is Elisp**. Email, terminal, file management, version control, calendar, RSS — all interactions unified into a single programmable environment where users can freely combine, modify, and extend.

OpenCLI is bringing this paradigm to AI agents: **everything is CLI**. Websites, Electron apps, local tools — all external interactions unified into a single programmable command-line environment where agents can freely discover, invoke, compose, repair, and even create new commands.

---

## I. The Plugin System: Minimal Glue, Maximum Reach

### The Emacs Way

The Emacs core is under 1MB, yet it connects to thousands of packages through package.el. Every package is Elisp code following the same interface conventions: buffer, mode, keymap, hook. This means:

- `magit` turns Git operations into interactive buffers
- `mu4e` turns email into searchable, programmable buffers
- `org-mode` unifies notes, TODOs, tables, and code execution into a single major mode

These packages compose freely: you can execute code blocks inside org-mode, trigger org-capture from magit, and write emails in org-mode format within mu4e. The power of packages lies not in individual features, but in their shared primitives (buffer, text, command) — which enable infinite composition.

### The OpenCLI Way

OpenCLI's core is a registry and an execution engine, but it connects to 80+ websites and tools through its plugin system. Every adapter — whether YAML or TypeScript — follows the same interface conventions: `site`, `name`, `args`, `columns`, `func/pipeline`.

```bash
# Every command shares a unified invocation style and output format
opencli bilibili hot --limit 5 -f json
opencli hackernews top --limit 5 -f json
opencli twitter search "AI agent" --limit 5 -f json

# Just as every Emacs mode shares buffer and text primitives,
# every opencli command shares args, columns, and format primitives
```

The parallels in how plugins are installed and activated run deep:

| Feature | Emacs | OpenCLI |
|---------|-------|---------|
| Installation | Drop into `~/.emacs.d/` or `use-package` | Drop into `~/.opencli/clis/` or `npx skills add` |
| Activation | `require` or `autoload` | Auto-registered on file save |
| Format | `.el` files | `.yaml` or `.ts` files |
| Distribution | MELPA / GitHub | GitHub plugin repos / monorepo |
| Lazy loading | `autoload` annotations | manifest + on-demand dynamic import |

A concrete example: when an agent needs to query Bilibili's trending videos, it doesn't need to understand Bilibili's anti-scraping mechanisms, Wbi signing algorithms, or cookie authentication flow. Just as an Emacs user doesn't need to understand the IMAP protocol to read email with `mu4e` — the complexity is encapsulated by the plugin, exposing only a clean command interface.

```bash
# The agent only needs this one line — no knowledge of Wbi signing or cookie handling required
opencli bilibili search "Rust tutorial" --limit 10 -f json
```

---

## II. Interaction Crystallization: Turning Ephemeral Actions into Permanent Skills

### The Emacs Way

Emacs users have a classic workflow:

1. **Manual operation**: Repeatedly execute a sequence of keystrokes in a buffer
2. **Record macro**: `C-x (` to start recording, perform actions, `C-x )` to end
3. **Name and save**: `M-x name-last-kbd-macro` to name the macro
4. **Persist to config**: `M-x insert-kbd-macro` to write it as Elisp
5. **Bind a key**: The operation is now a permanent part of your editor

More advanced users skip straight to writing `defun`, `defadvice`, and `minor-mode`, abstracting recurring operations into composable commands. Interactive operation → record → crystallize → compose — this is the Emacs user's daily rhythm.

### The OpenCLI Way

OpenCLI's `operate` feature provides a directly parallel workflow:

1. **Manual browsing**: Agent explores a website with `opencli operate open/state/click/type`
2. **API discovery**: Agent captures network requests with `opencli operate network`
3. **Scaffold generation**: `opencli operate init hn/top` auto-generates an adapter template
4. **Write logic**: Fill in the `func` implementation (or write a YAML pipeline)
5. **Verify and crystallize**: `opencli operate verify hn/top` — the command is now permanently available

```bash
# An exploratory browsing session
opencli operate open https://news.ycombinator.com
opencli operate state                    # Observe DOM structure
opencli operate network                  # Discover Firebase API
opencli operate network --detail 0       # Inspect response structure

# Crystallize into a permanently available CLI command
opencli operate init hn/top
# → Generates ~/.opencli/clis/hn/top.ts
# → From now on, `opencli hn top --limit 10` just works
```

This is like an Emacs user crystallizing a keyboard macro into an Elisp function — once crystallized, invocation no longer requires keystroke-by-keystroke replay. The function is faster, more reliable, and more composable. OpenCLI's crystallization mechanism transforms an agent's "improvisational browsing" into "compiled skills." And this leap from macro to function brings more than just convenience — it brings staggering economics.

---

## III. Token Economics: From "Improvise Every Time" to "Write Once, Call Forever"

The value of crystallization goes beyond convenience — it's about **economics**. This is OpenCLI's most practically valuable feature compared to other agent tool frameworks, and the one that most embodies the Emacs philosophy.

### Cost Comparison

Consider a scenario: an agent needs to check Bilibili's trending list 10 times daily to assist with content creation.

**Plan A: Improvise with operate each time (analogous to manual Emacs operations)**

```
Per invocation:
  open → state → eval → parse ≈ 4 tool calls
  Input tokens ≈ 3,000 (DOM snapshot + system prompt)
  Output tokens ≈ 500 (result parsing)
Daily cost: 10 × 3,500 = 35,000 tokens
Monthly cost: ~1,050,000 tokens
```

**Plan B: Call the crystallized CLI command (analogous to calling a well-defined Elisp function)**

```
Per invocation:
  opencli bilibili hot -f json → 1 tool call
  Input tokens ≈ 200 (command + structured JSON result)
  Output tokens ≈ 100 (directly reference result)
Daily cost: 10 × 300 = 3,000 tokens
Monthly cost: ~90,000 tokens

Savings: 92% token reduction
```

This is like an Emacs user turning repeatedly hand-executed operations into a `defun` — a keyboard macro records keystrokes and replays them one by one; a `defun` compiles logic and executes directly. OpenCLI's crystallization mechanism is equivalent to this leap from macro to function.

At a deeper level, this reflects a design philosophy: **runtime complexity should be resolved at development time, not re-paid on every invocation**. The time an Emacs user invests writing Elisp config buys zero cognitive overhead on every subsequent operation. The one-time token investment an agent spends exploring and writing an adapter buys deterministic results and minimal token cost on every subsequent call.

---

## IV. Self-Repair: Agents Fix Adapters Like Emacs Users Fix Elisp

### The Emacs Way

When an Emacs user hits a bug, the workflow looks like this:

1. **Encounter error**: A command fails, `*Messages*` buffer shows a backtrace
2. **Locate source**: `M-x find-function` jumps to the failing Elisp function definition
3. **Read and understand**: The code is right there, readable at a glance
4. **Edit in place**: Modify the `.el` file directly
5. **Instant effect**: `M-x eval-buffer` or `C-x C-e` evaluates the change — no restart needed
6. **Continue working**: Fix complete, environment state fully preserved

This "transparent modifiability" is Emacs's most underappreciated yet most powerful quality. Users aren't consumers of their tools — they're co-maintainers. Configuration broke? Open the `.el`, change one line, eval, done. No waiting for an upstream release. No filing an issue and waiting three months.

### The OpenCLI Way

OpenCLI's adapter repair workflow is strikingly similar:

1. **Encounter error**: `opencli zhihu hot` fails with a SELECTOR error
2. **Collect diagnostics**: `OPENCLI_DIAGNOSTIC=1 opencli zhihu hot 2>diag.json` emits structured diagnostic context (error code, adapter source, DOM snapshot, network requests)
3. **Locate source**: The diagnostic JSON's `adapter.sourcePath` points directly to the `.ts` file
4. **Read and understand**: Adapter code is fully readable — YAML is a declarative pipeline, TS is standard TypeScript
5. **Edit in place**: Agent directly edits the `.ts` or `.yaml` file, replacing stale selectors or API paths
6. **Instant effect**: File save triggers automatic re-registration; next invocation uses the new logic
7. **Continue working**: No process restart required

```
# A real-world repair scenario
1. Agent runs opencli zhihu hot → Fails: SELECTOR ".HotList-item" not found
2. Agent runs OPENCLI_DIAGNOSTIC=1 opencli zhihu hot 2>diag.json
3. Diagnostic shows: DOM snapshot has .HotItem instead of .HotList-item
4. Agent uses opencli operate to open Zhihu and confirm the new class name
5. Agent edits clis/zhihu/hot.ts: replaces ".HotList-item" with ".HotItem"
6. Agent runs opencli zhihu hot → Success
```

Side-by-side comparison of the repair loops:

| Step | Emacs User | AI Agent + OpenCLI |
|------|-----------|-------------------|
| Error discovery | `*Messages*` backtrace | `OPENCLI_DIAGNOSTIC=1` emits RepairContext JSON |
| Locate source | `M-x find-function` | `adapter.sourcePath` field |
| Understand context | Read Elisp code + docstring | Read TS/YAML code + DOM snapshot + network requests |
| Repair | Edit `.el` file | Edit `.ts` / `.yaml` file |
| Activate | `eval-buffer` | File save, auto-reload |
| Verify | Re-invoke the command | `opencli operate verify` or direct invocation |

The crucial design decision here: **adapters are not compiled black boxes — they are transparent source code**. The agent doesn't need to decompile, doesn't need to understand private APIs, doesn't need to wait for the author to ship a patch. Adapter broke? The agent fixes it — as naturally as an Emacs user fixes their own config.

---

## V. A Programmable Environment: Not a Toolbox, but a Workbench

### The Emacs Philosophy

The key to understanding Emacs isn't how many features it has — it's the meta-level: Emacs is an environment for *building* editor features. It provides not "100 commands" but "primitives for constructing commands" — buffer, overlay, keymap, hook, advice. Users build freely atop these primitives, producing an ecosystem spanning from `org-roam` (knowledge graph) to `emms` (music player) to `elfeed` (RSS reader).

Emacs's vitality springs from this **meta-programmability**:

- `defadvice` injects custom logic before or after any function
- `hook` turns every event into an extension point
- `minor-mode` allows features to stack orthogonally
- `eval-expression` lets users execute arbitrary Lisp at any moment

### OpenCLI's Counterpart

OpenCLI is not simply "CLI wrappers for 80 websites." It provides primitives for constructing CLI commands:

**Pipeline steps as primitives:**

```yaml
# These steps compose freely, just as Emacs buffer operations compose freely
pipeline:
  - fetch:       # HTTP request (analogous to url-retrieve)
  - navigate:    # Browser navigation (analogous to find-file)
  - evaluate:    # Execute JS in browser (analogous to eval-expression)
  - select:      # Extract nested data (analogous to narrow-to-region)
  - map:         # Transform each item (analogous to mapcar)
  - filter:      # Filter data (analogous to seq-filter)
  - tap:         # Invoke frontend framework Store Actions (analogous to advice-add)
  - intercept:   # Intercept network requests (analogous to url-retrieve with hooks)
  - limit:       # Truncate results (analogous to seq-take)
```

**Registration mechanism as extension points:**

```typescript
// Just as Emacs's define-derived-mode can inherit and extend modes,
// OpenCLI's cli() can register any new command
cli({
  site: 'mysite',
  name: 'search',
  args: [{ name: 'query', positional: true, required: true }],
  func: async (page, kwargs) => {
    // Fully unconstrained TypeScript logic
  },
});
```

**Operate as eval-expression:**

```bash
# Just as Emacs users can M-: to evaluate Elisp at any time,
# agents can execute arbitrary JavaScript in the browser via operate eval
opencli operate eval "(function(){
  return JSON.stringify(
    [...document.querySelectorAll('.item')]
      .map(e => ({ title: e.textContent, href: e.href }))
  );
})()"
```

The result of this meta-programmability: **the agent's capability boundary is determined not by OpenCLI's authors, but by the agent itself**. OpenCLI provides the environment and primitives; agents build freely on top. This is the essence of the Emacs philosophy — tools don't constrain users; tools empower them.

---

## VI. External Tool Unification: Emacs's M-x shell Meets OpenCLI's CLI Hub

### The Emacs Way

Emacs users rarely leave Emacs. Not because there aren't good external tools, but because Emacs can pull them in:

- `M-x shell` / `M-x eshell`: Run a shell inside Emacs
- `M-x compile`: Run builds inside Emacs with automatic source-location jumping on errors
- `forge`: Manage GitHub PRs and Issues inside Emacs
- `dired`: Manage the filesystem inside Emacs
- `proced`: Manage system processes inside Emacs

Once integrated, every external tool gains Emacs superpowers: searchable, programmable, composable, macro-recordable. `git` isn't just `git` — through `magit`, it becomes an interactive, undoable, scriptable version control interface.

### The OpenCLI Way

OpenCLI's CLI Hub does the same thing:

```bash
# Register external CLIs
opencli register gh          # GitHub CLI
opencli register docker      # Docker CLI
opencli register vercel      # Vercel CLI

# Unified discovery
opencli list                 # List all commands, both built-in and external

# Auto-installation
opencli gh pr list           # If gh isn't installed, auto-runs brew install gh then executes
```

Once integrated, agents gain not just invocation capability, but all of OpenCLI's primitives:

- **Unified output format**: `-f json`, `-f table`, `-f csv` — whether it's Bilibili trending or GitHub PR list, the output structure is consistent
- **Unified discovery**: `opencli list` — one command reveals all available tools; the agent never has to guess what's available
- **Unified parameters**: `--limit`, `--format`, `--help` — universal arguments shared across all commands
- **Auto-installation**: Missing tools are automatically installed via the package manager; the agent never has to handle `command not found`

This mirrors Emacs's `compile` command — once `gcc`'s output is parsed by Emacs, errors are no longer lines of text but hyperlinks that jump directly to source locations. Uniformity of form enables freedom of composition.

---

## VII. Dynamic Loading: The Save-and-It-Works Feedback Loop

### The Emacs Way

One of Emacs's most addictive qualities is the instant feedback of `eval-buffer`: modify a function definition, `C-x C-e` to evaluate, and the new behavior takes effect immediately. No restart, no recompile, no waiting. The feedback loop is near-zero:

```
Edit .el file → eval-buffer → New behavior active (< 1 second)
```

This is the natural advantage of the Lisp family — code is data, runtime is compile-time.

### The OpenCLI Way

OpenCLI's dynamic loading mechanism provides nearly the same experience:

```
Edit .ts/.yaml file → Save → Next invocation automatically uses the new version
```

For user-defined adapters (files under `~/.opencli/clis/`), OpenCLI dynamically scans and registers on every command execution. This means:

- Agent edits an adapter → the very next `opencli` call uses the new version
- No `npm run build` required
- No daemon restart required
- No cache clearing required

For built-in adapters, the manifest provides production-grade performance (cold start < 100ms), while development-mode dynamic scanning guarantees edit-and-it-works.

This instant feedback loop is critical for agent self-repair. Imagine if modifying an adapter required recompiling, restarting a service, and waiting for cache invalidation — the agent's repair workflow would become: edit → build → restart → wait → verify, with each step a potential failure point. In OpenCLI's design, this loop is compressed to the same radical simplicity as Emacs's `eval-buffer`: edit, save, invoke, verify.

---

## VIII. Summary: Two Programmable Environments, One Isomorphism

| Dimension | Emacs | OpenCLI |
|-----------|-------|---------|
| **Core identity** | Programmable editing environment for humans | Programmable CLI environment for AI agents |
| **Extension language** | Emacs Lisp | TypeScript / YAML |
| **Plugin installation** | `~/.emacs.d/` + `package-install` | `~/.opencli/clis/` + file drop |
| **Instant activation** | `eval-buffer` | Auto-registered on file save |
| **Interactive exploration** | `M-x ielm` (REPL) | `opencli operate` (browser REPL) |
| **Operation recording** | `C-x (` keyboard macro | `opencli operate` exploration flow |
| **Operation crystallization** | `defun` + `insert-kbd-macro` | `opencli operate init` → `.ts` file |
| **Error diagnostics** | `*Messages*` + `toggle-debug-on-error` | `OPENCLI_DIAGNOSTIC=1` + RepairContext JSON |
| **Source location** | `M-x find-function` | `adapter.sourcePath` |
| **In-place repair** | Edit `.el` + `eval-buffer` | Edit `.ts` / `.yaml` + save |
| **External tool integration** | `shell` / `compile` / `magit` | CLI Hub + `opencli register` |
| **Output unification** | Everything is buffer + text | Everything is JSON / table / csv |
| **Composability** | hook + advice + minor-mode | Pipeline steps + command chaining |
| **Meta-programming** | `defmacro` / `eval-expression` | `operate eval` / custom pipeline steps |
| **Zero-cost abstraction** | Write Elisp once, invoke with a keystroke | Crystallize adapter once, invoke with a command |

---

## Conclusion: Programmability Is the Most Profound Design Choice

Emacs was born in 1976 and still has a thriving community — not because its default features are so great, but because it chose **programmability** as its first design principle. When a system hands control to its users, its longevity no longer depends on the author's energy but on the creativity of the entire community.

OpenCLI has made the same choice: it doesn't attempt to enumerate every website's API. Instead, it provides an environment where agents (and developers) can explore, encapsulate, repair, and compose on their own. When Zhihu changes a CSS class name, the agent doesn't wait for an OpenCLI release — it opens the website, edits a few lines of adapter code, saves, and moves on. When the agent needs a command that doesn't exist yet, it uses `operate` to explore, `init` to scaffold, fills in the logic, verifies — and a new CLI command is born.

This isn't the future of AI. This is what Emacs users have been doing every day for 40 years. Only now, it's not just humans doing it anymore.

---

*OpenCLI gives agents the freedom to edit, save, and compose — everything is CLI, just as in Emacs everything is buffer. When an agent has a programmable environment, its capability boundary is no longer the length of a tool list, but the edge of imagination.*
