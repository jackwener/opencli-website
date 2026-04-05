# OpenCLI：AI Agent 的 Emacs

> 当我们谈论 Emacs 时，我们谈论的不是一个编辑器，而是一个可编程的环境。OpenCLI 正在为 AI Agent 做同样的事。

---

## 引言：从「给 Agent 一个工具」到「给 Agent 一个环境」

当前 AI Agent 生态面临一个根本矛盾：Agent 的能力边界被它所能调用的工具严格限定。每接入一个新服务，开发者就要写一套 API wrapper、处理认证、解析响应、维护版本——这和 40 年前每用一个新功能就要换一个专用编辑器的状况何其相似。

Emacs 用一个激进的设计哲学终结了这种碎片化：**万物皆可 Elisp**。邮件、终端、文件管理、版本控制、日历、RSS——所有交互都被统一到同一个可编程环境中，用户可以自由组合、修改、扩展。

OpenCLI 正在为 AI Agent 复现这个范式：**万物皆可 CLI**。网站、Electron 应用、本地工具——所有外部交互都被统一到一个可编程的命令行环境中，Agent 可以自由发现、调用、组合、修复，甚至创造新的命令。

---

## 一、插件系统：用最小的胶水粘合最大的世界

### Emacs 的方式

Emacs 的核心不到 1MB，但它通过 package.el 连接了数千个插件。每个插件都是 Elisp 代码，遵循相同的接口约定：buffer、mode、keymap、hook。这意味着：

- `magit` 把 Git 操作变成了交互式 buffer
- `mu4e` 把邮件变成了可搜索、可编程的 buffer
- `org-mode` 把笔记、TODO、表格、代码执行统一到一个 major mode

这些插件之间可以自由组合：你可以在 org-mode 里执行代码块，在 magit 里触发 org-capture，在 mu4e 里用 org-mode 格式写邮件。插件的力量不在于单个功能，而在于它们共享同一套原语（buffer、text、command），因此可以无限组合。

### OpenCLI 的方式

OpenCLI 的核心是一个注册表（registry）和一套执行引擎，但它通过插件系统连接了 80+ 网站和工具。每个适配器——无论 YAML 还是 TypeScript——都遵循相同的接口约定：`site`、`name`、`args`、`columns`、`func/pipeline`。

```bash
# 所有命令共享统一的调用方式和输出格式
opencli bilibili hot --limit 5 -f json
opencli hackernews top --limit 5 -f json
opencli twitter search "AI agent" --limit 5 -f json

# 就像 Emacs 中所有 mode 共享 buffer 和 text 原语
# 所有 opencli 命令共享 args、columns、format 原语
```

更关键的是，插件的安装和生效方式与 Emacs 一脉相承：

| 特性 | Emacs | OpenCLI |
|------|-------|---------|
| 安装方式 | 放入 `~/.emacs.d/` 或 `use-package` | 放入 `~/.opencli/clis/` 或 `npx skills add` |
| 生效时机 | `require` 或 `autoload` | 文件落盘即自动注册 |
| 格式 | `.el` 文件 | `.yaml` 或 `.ts` 文件 |
| 共享机制 | MELPA / GitHub | GitHub 插件仓库 / monorepo |
| 懒加载 | `autoload` 注解 | manifest + 按需动态 import |

一个典型例子：当 Agent 需要查询 Bilibili 热门视频时，它不需要理解 Bilibili 的反爬机制、Wbi 签名算法、Cookie 鉴权流程。就像 Emacs 用户不需要理解 IMAP 协议就能用 `mu4e` 收邮件一样——复杂性被插件封装了，暴露出来的是干净的命令接口。

```bash
# Agent 只需知道这一行，不需要知道背后的 Wbi 签名和 Cookie 处理
opencli bilibili search "Rust 教程" --limit 10 -f json
```

---

## 二、交互沉淀：把瞬时操作变成持久技能

### Emacs 的方式

Emacs 用户有一个经典的工作流：

1. **手动操作**：在 buffer 中反复执行一组按键
2. **录制宏**：`C-x (` 开始录制，操作，`C-x )` 结束
3. **命名保存**：`M-x name-last-kbd-macro` 给宏命名
4. **写入配置**：`M-x insert-kbd-macro` 把宏持久化为 Elisp
5. **绑定快捷键**：这个操作从此成为编辑器的一部分

更高级的用户会直接写 `defun`、`defadvice`、`minor-mode`，把反复出现的操作抽象成可组合的命令。交互式操作 -> 录制 -> 固化 -> 组合，这是 Emacs 用户的日常。

### OpenCLI 的方式

OpenCLI 的 `operate` 功能提供了完全对等的工作流：

1. **手动浏览**：Agent 用 `opencli operate open/state/click/type` 探索网站
2. **发现 API**：用 `opencli operate network` 捕获网络请求，找到数据接口
3. **生成脚手架**：`opencli operate init hn/top` 自动生成适配器模板
4. **编写逻辑**：填入 `func` 实现（或编写 YAML pipeline）
5. **验证固化**：`opencli operate verify hn/top`，命令从此可用

```bash
# 一次探索性的浏览操作
opencli operate open https://news.ycombinator.com
opencli operate state                    # 观察 DOM 结构
opencli operate network                  # 发现 Firebase API
opencli operate network --detail 0       # 查看响应结构

# 沉淀为一个永久可用的 CLI 命令
opencli operate init hn/top
# → 生成 ~/.opencli/clis/hn/top.ts
# → 从此 `opencli hn top --limit 10` 永久可用
```

这就像 Emacs 用户把 keyboard macro 固化为 Elisp 函数后，调用时不再需要逐键回放——函数比宏更快、更可靠、更可组合。OpenCLI 的沉淀机制把 Agent 的「即兴浏览」变成了「编译好的技能」。而这个从 macro 到 function 的跃迁，带来的不只是便利性——更是惊人的经济性。

---

## 三、节省 Token：从「每次现场即兴」到「一次编写永久调用」

沉淀机制的价值不只是便利性，更是**经济性**。这是 OpenCLI 相比其他 Agent 工具框架最具实用价值的特性，也最能体现 Emacs 哲学的设计。

### 成本对比

考虑一个场景：Agent 每天需要查看 10 次 Bilibili 热搜来辅助内容创作。

**方案 A：每次用 operate 现场浏览（类比 Emacs 中每次手动操作）**

```
每次消耗：
  open → state → eval → 解析 ≈ 4 次工具调用
  输入 token ≈ 3000（DOM 快照 + 系统提示）
  输出 token ≈ 500（结果解析）
每天消耗：10 × 3500 = 35,000 token
每月消耗：~1,050,000 token
```

**方案 B：沉淀为 CLI 命令后调用（类比 Emacs 中写好函数后调用）**

```
每次消耗：
  opencli bilibili hot -f json → 1 次工具调用
  输入 token ≈ 200（命令 + 结构化 JSON 结果）
  输出 token ≈ 100（直接引用结果）
每天消耗：10 × 300 = 3,000 token
每月消耗：~90,000 token

节省：92% 的 token 消耗
```

这就像 Emacs 用户把反复手动执行的操作写成 `defun` 一样——keyboard macro 录制的是按键序列，每次回放还要逐键执行；`defun` 编译的是逻辑，调用时直接跳转。OpenCLI 的沉淀机制等价于这个从 macro 到 function 的跃迁。

更深层地说，这体现了一个设计哲学：**运行时的复杂性应该在开发时解决，而不是每次调用时重复支付**。Emacs 用户写 Elisp 配置的时间投入，换来的是此后每次操作的零认知开销。OpenCLI 中 Agent 探索和编写适配器的一次性 token 投入，换来的是此后每次调用的确定性结果和最小 token 消耗。

---

## 四、自我修复：Agent 修 Adapter 就像 Emacs 用户修 Elisp

### Emacs 的方式

Emacs 用户碰到 bug 时，工作流是这样的：

1. **遇到错误**：某个命令报错，`*Messages*` buffer 显示 backtrace
2. **定位源码**：`M-x find-function` 跳到出错的 Elisp 函数定义
3. **阅读理解**：代码就在面前，读完就懂
4. **就地修改**：直接在 `.el` 文件中编辑
5. **即时生效**：`M-x eval-buffer` 或 `C-x C-e` 对修改求值，无需重启
6. **继续工作**：修复完成，环境状态完全保持

这种「透明可修改」的特性是 Emacs 最被低估也最强大的能力。用户不是工具的消费者，而是工具的共同维护者。一个配置出了问题？打开 `.el`，改一行，eval，搞定。不需要等上游发版，不需要提 issue 等三个月。

### OpenCLI 的方式

OpenCLI 的适配器修复流程与此惊人地相似：

1. **遇到错误**：`opencli zhihu hot` 失败，返回 SELECTOR 错误
2. **获取诊断**：`OPENCLI_DIAGNOSTIC=1 opencli zhihu hot 2>diag.json` 输出结构化诊断上下文（包含错误码、适配器源码、DOM 快照、网络请求）
3. **定位源码**：诊断 JSON 中的 `adapter.sourcePath` 直接指向 `.ts` 文件
4. **阅读理解**：适配器代码完全可读——YAML 是声明式管道，TS 是标准 TypeScript
5. **就地修改**：Agent 直接编辑 `.ts` 或 `.yaml` 文件，替换失效的选择器或 API 路径
6. **即时生效**：文件保存后自动重新注册，下次调用即用新逻辑
7. **继续工作**：无需重启任何进程

```
# 一个真实的修复场景
1. Agent 运行 opencli zhihu hot → 失败: SELECTOR ".HotList-item" not found
2. Agent 运行 OPENCLI_DIAGNOSTIC=1 opencli zhihu hot 2>diag.json
3. 诊断显示：DOM 快照中 .HotList-item 已变为 .HotItem
4. Agent 用 opencli operate 打开知乎确认新的 class name
5. Agent 编辑 clis/zhihu/hot.ts：将 ".HotList-item" 替换为 ".HotItem"
6. Agent 运行 opencli zhihu hot → 成功
```

对比一下两者的修复循环：

| 步骤 | Emacs 用户 | AI Agent + OpenCLI |
|------|-----------|-------------------|
| 错误发现 | `*Messages*` backtrace | `OPENCLI_DIAGNOSTIC=1` 输出 RepairContext JSON |
| 定位源码 | `M-x find-function` | `adapter.sourcePath` 字段 |
| 理解上下文 | 读 Elisp 代码 + docstring | 读 TS/YAML 代码 + DOM snapshot + network requests |
| 修复 | 在 `.el` 中编辑 | 在 `.ts` / `.yaml` 中编辑 |
| 生效 | `eval-buffer` | 文件保存，自动重载 |
| 验证 | 重新调用命令 | `opencli operate verify` 或直接调用 |

这里最关键的设计决策是：**适配器不是编译后的黑盒，而是透明的源码**。Agent 不需要反编译、不需要理解私有 API、不需要等作者发补丁。适配器坏了，Agent 自己修——就像 Emacs 用户修自己的配置一样自然。

---

## 五、可编程环境：不是工具箱，是工作台

### Emacs 的哲学

理解 Emacs 的关键不是它有多少功能，而是它的元层级：Emacs 是一个用来构建编辑器功能的环境。它提供的不是「100 个命令」，而是「构建命令的原语」——buffer、overlay、keymap、hook、advice。用户在这些原语上自由构建，形成了从 `org-roam`（知识图谱）到 `emms`（音乐播放器）到 `elfeed`（RSS 阅读器）的生态。

Emacs 的生命力来自这种**元可编程性**：

- `defadvice` 可以在任何函数执行前后注入自定义逻辑
- `hook` 让每个事件都成为扩展点
- `minor-mode` 让功能可以正交叠加
- `eval-expression` 让用户在任何时刻执行任意 Lisp 表达式

### OpenCLI 的对位

OpenCLI 也不是「80 个网站的 CLI wrapper」这么简单。它提供的是构建 CLI 命令的原语：

**Pipeline 步骤即原语：**

```yaml
# 这些步骤可以自由组合，就像 Emacs 的 buffer 操作可以自由组合
pipeline:
  - fetch:       # 发起 HTTP 请求（类比 url-retrieve）
  - navigate:    # 浏览器导航（类比 find-file）
  - evaluate:    # 在浏览器中执行 JS（类比 eval-expression）
  - select:      # 提取嵌套数据（类比 narrow-to-region）
  - map:         # 转换每一项（类比 mapcar）
  - filter:      # 过滤数据（类比 seq-filter）
  - tap:         # 调用前端框架的 Store Action（类比 advice-add）
  - intercept:   # 拦截网络请求（类比 url-retrieve-synchronously with hooks）
  - limit:       # 截断结果（类比 seq-take）
```

**注册机制即扩展点：**

```typescript
// 就像 Emacs 的 define-derived-mode 可以继承和扩展 mode
// OpenCLI 的 cli() 可以注册任何新命令
cli({
  site: 'mysite',
  name: 'search',
  args: [{ name: 'query', positional: true, required: true }],
  func: async (page, kwargs) => {
    // 完全自由的 TypeScript 逻辑
  },
});
```

**Operate 即 eval-expression：**

```bash
# 就像 Emacs 用户随时可以 M-: 执行 Elisp
# Agent 随时可以通过 operate eval 在浏览器中执行任意 JavaScript
opencli operate eval "(function(){
  return JSON.stringify(
    [...document.querySelectorAll('.item')]
      .map(e => ({ title: e.textContent, href: e.href }))
  );
})()"
```

这种元可编程性带来的结果是：**Agent 的能力边界不由 OpenCLI 的作者决定，而由 Agent 自己决定**。OpenCLI 提供环境和原语，Agent 在上面自由构建。这正是 Emacs 哲学的精髓——工具不限制用户，工具赋能用户。

---

## 五、外部工具统一：Emacs 的 M-x shell 与 OpenCLI 的 CLI Hub

### Emacs 的方式

Emacs 用户很少离开 Emacs。不是因为外面没有好工具，而是因为 Emacs 能把外部工具拉进来：

- `M-x shell` / `M-x eshell`：在 Emacs 里运行 shell
- `M-x compile`：在 Emacs 里运行编译，错误自动跳转到源码
- `forge`：在 Emacs 里操作 GitHub PR 和 Issue
- `dired`：在 Emacs 里管理文件系统
- `proced`：在 Emacs 里管理系统进程

每个外部工具被集成后，都获得了 Emacs 的超能力：可搜索、可编程、可组合、可录制宏。`git` 不只是 `git`——通过 `magit`，它变成了可交互、可撤销、可脚本化的版本控制界面。

### OpenCLI 的方式

OpenCLI 的 CLI Hub 做了同样的事：

```bash
# 注册外部 CLI
opencli register gh          # GitHub CLI
opencli register docker      # Docker CLI
opencli register vercel      # Vercel CLI

# 统一发现
opencli list                 # 列出所有命令，包括内置和外部

# 自动安装
opencli gh pr list           # 如果 gh 未安装，自动 brew install gh 后执行
```

外部工具被集成后，Agent 获得的不只是调用能力，而是 OpenCLI 的所有原语：

- **统一输出格式**：`-f json`、`-f table`、`-f csv`——无论是 Bilibili 热搜还是 GitHub PR 列表，输出结构一致
- **统一发现**：`opencli list` 一条命令列出所有可用工具，Agent 不需要猜有什么可用
- **统一参数**：`--limit`、`--format`、`--help`——所有命令共享的通用参数
- **自动安装**：缺少的工具自动通过包管理器安装，Agent 不需要处理 `command not found`

这和 Emacs 的 `compile` 命令何其相似——`gcc` 的输出被 Emacs 解析后，错误不再是一行文本，而是可以直接跳转到源码的超链接。形式的统一带来了组合的自由。

---

## 六、动态加载：保存即生效的即时反馈循环

### Emacs 的方式

Emacs 最让人上瘾的特性之一是 `eval-buffer` 的即时反馈：修改一个函数定义，`C-x C-e` 求值，新行为立刻生效，不需要重启，不需要重新编译，不需要等待。这个反馈循环短到几乎为零：

```
编辑 .el 文件 → eval-buffer → 新行为生效（< 1 秒）
```

这是 Lisp 家族语言的天然优势——代码就是数据，运行时就是编译时。

### OpenCLI 的方式

OpenCLI 的动态加载机制提供了几乎相同的体验：

```
编辑 .ts/.yaml 文件 → 保存 → 下次调用自动使用新版本
```

对于用户自定义适配器（`~/.opencli/clis/` 下的文件），OpenCLI 在每次命令执行时动态扫描并注册。这意味着：

- Agent 编辑了一个适配器 → 下一次 `opencli` 调用就用新版本
- 不需要 `npm run build`
- 不需要重启 daemon
- 不需要清缓存

对于内置适配器，manifest 提供了生产级性能（冷启动 < 100ms），同时开发模式下的动态扫描保证了修改即生效。

这种即时反馈循环对 Agent 的自修复能力至关重要。设想一下如果修改一个适配器后需要重新编译、重启服务、等待缓存失效——Agent 的修复工作流会变成：编辑 → 构建 → 重启 → 等待 → 验证，每个环节都可能失败。而在 OpenCLI 的设计中，这个循环被压缩到了和 Emacs `eval-buffer` 同样的极致简洁：改完，保存，调用，验证。

---

## 七、对比总结：两个可编程环境的同构

| 维度 | Emacs | OpenCLI |
|------|-------|---------|
| **核心定位** | 人类的可编程编辑环境 | AI Agent 的可编程 CLI 环境 |
| **扩展语言** | Emacs Lisp | TypeScript / YAML |
| **插件安装** | `~/.emacs.d/` + `package-install` | `~/.opencli/clis/` + 文件落盘 |
| **即时生效** | `eval-buffer` | 文件保存后自动注册 |
| **交互探索** | `M-x ielm`（REPL） | `opencli operate`（浏览器 REPL） |
| **操作录制** | `C-x (` keyboard macro | `opencli operate` 探索流程 |
| **操作固化** | `defun` + `insert-kbd-macro` | `opencli operate init` → `.ts` 文件 |
| **错误诊断** | `*Messages*` + `toggle-debug-on-error` | `OPENCLI_DIAGNOSTIC=1` + RepairContext JSON |
| **源码定位** | `M-x find-function` | `adapter.sourcePath` |
| **就地修复** | 编辑 `.el` + `eval-buffer` | 编辑 `.ts` / `.yaml` + 保存 |
| **外部工具集成** | `shell` / `compile` / `magit` | CLI Hub + `opencli register` |
| **输出统一** | 一切皆 buffer + text | 一切皆 JSON / table / csv |
| **可组合性** | hook + advice + minor-mode | pipeline 步骤 + 命令 chaining |
| **元编程** | `defmacro` / `eval-expression` | `operate eval` / 自定义 pipeline step |
| **零成本抽象** | 写好 Elisp 后按键即触发 | 沉淀适配器后一条命令即执行 |

---

## 结语：可编程性是最深刻的设计选择

Emacs 诞生于 1976 年，至今仍有活跃社区，不是因为它的默认功能多好用，而是因为它选择了「可编程性」作为第一设计原则。当一个系统把控制权交给用户时，它的生命力就不再取决于作者的精力，而取决于整个社区的创造力。

OpenCLI 做了同样的选择：它不试图穷举所有网站的 API，而是提供一个环境，让 Agent（和开发者）自己去探索、封装、修复、组合。当知乎改了 CSS class name，Agent 不需要等 OpenCLI 发版——它自己打开网站看看，改几行适配器代码，保存，继续工作。当 Agent 需要一个还不存在的命令，它用 `operate` 探索，用 `init` 生成脚手架，填入逻辑，验证通过——一个新的 CLI 命令就此诞生。

这不是 AI 的未来，这是 Emacs 用户 40 年来每天都在做的事。只不过现在，做这件事的不只是人了。

---

*OpenCLI 给了 Agent 自由编辑、保存、组合的能力——万物皆可 CLI，正如 Emacs 中万物皆可 buffer。当 Agent 拥有了一个可编程的环境，它的能力边界就不再是工具清单的长度，而是想象力的边界。*
