# Design: translite

## Goal
实现一个基于 Electron 的超轻量翻译工具，通过全局快捷键快速呼出/隐藏小窗，使用 DeepSeek V4 Flash AI 模型进行翻译。

## Scope
- In:
  - Electron 主进程 + React 渲染进程架构
  - 全局快捷键呼出/隐藏窗口（默认 `Alt+T`）
  - 上下分栏 UI：上方输入待翻译文本，下方显示翻译结果
  - 底部工具栏：窗口置顶开关、互译语言对选择（中英自动检测）
  - DeepSeek V4 Flash API 调用（用户自行配置 API Key）
  - Windows 10/11 支持
  - pnpm + React + TypeScript + Tailwind CSS 技术栈
- Out:
  - macOS / Linux 支持（后续可扩展）
  - 离线翻译能力
  - 翻译历史记录 / 收藏功能
  - 系统托盘常驻（首期不做）
  - 多语言 UI（仅中文界面）

## Assumptions
- 用户已有或愿意注册 DeepSeek API Key
- 翻译方向为双向：中文输入→英文输出，英文输入→中文输出，通过简单规则自动检测输入语言
- DeepSeek API 兼容 OpenAI SDK 格式（base_url: `https://api.deepseek.com`）

## Current Behavior
- 空项目，无现有代码

## Proposed Behavior
1. 用户首次启动 → 弹出设置面板要求输入 DeepSeek API Key → 保存到本地（electron-store）
2. 用户按下 `Alt+T` → 翻译小窗从屏幕右上角弹出（置顶，始终在前）
3. 用户在上方输入框键入文本 → 实时或按回车触发翻译请求
4. 下方显示 DeepSeek 返回的翻译结果
5. 底部工具栏：置顶开关、语言对选择（中↔英）
6. 再次按 `Alt+T` → 窗口隐藏
7. 窗口隐藏时不退出应用，继续在后台监听快捷键

## Implementation Direction

### 项目结构
```
translite/
├── electron/
│   ├── main.ts              # Electron 主进程：窗口管理、快捷键、托盘
│   ├── preload.ts            # preload 脚本，暴露 IPC 方法
│   └── ipc-handlers.ts       # IPC 处理：翻译请求、设置读写
├── src/
│   ├── App.tsx               # 根组件
│   ├── main.tsx              # React 入口
│   ├── components/
│   │   ├── InputPanel.tsx    # 上方输入区
│   │   ├── ResultPanel.tsx   # 下方结果区
│   │   ├── Toolbar.tsx       # 底部工具栏
│   │   └── SettingsModal.tsx # API Key 设置弹窗
│   ├── hooks/
│   │   └── useTranslate.ts   # 翻译逻辑 Hook
│   ├── lib/
│   │   ├── translate.ts      # DeepSeek API 调用封装
│   │   ├── lang-detect.ts    # 简单中英文检测
│   │   └── store.ts          # 设置存储（通过 IPC 读写 electron-store）
│   └── styles/
│       └── index.css         # Tailwind 入口
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── electron-builder.yml      # Electron 打包配置
```

### 技术选型
| 层面 | 选择 | 理由 |
|------|------|------|
| 构建工具 | Vite + electron-builder | Vite 快速构建 React，electron-builder 打包 Windows |
| 主进程构建 | electron-vite 或手动 tsx | 轻量，避免重型框架 |
| UI | React 18 + Tailwind CSS 4 | 用户指定 |
| 状态管理 | React 内置 useState/useReducer | 轻量工具无需 Redux |
| 设置持久化 | electron-store | 轻量 JSON 文件存储 |
| HTTP 客户端 | 主进程中使用 Node fetch | 无需额外依赖 |
| 语言检测 | 正则判断 CJK 字符占比 | 中英互译场景足够 |

### 核心流程

**快捷键与窗口管理（main.ts）**
- 使用 `globalShortcut.register('Alt+T', ...)` 注册全局快捷键
- 窗口属性：`frame: false`, `transparent: false`, `alwaysOnTop: true`, `skipTaskbar: true`
- 窗口尺寸约 `420×500`，位置在屏幕右上角
- 快捷键触发时 toggle 窗口 show/hide + focus

**翻译流程（IPC）**
1. 渲染进程通过 `window.api.translate(text, langPair)` 发起请求
2. 主进程收到 IPC 消息，调用 DeepSeek Chat Completions API
3. System prompt 设计：`"You are a professional translator. Translate the following text. Only output the translation result, nothing else."`
4. 用户消息中附带语言方向
5. 流式返回（SSE）通过 IPC 逐 chunk 推送到渲染进程，实现打字机效果
6. 渲染进程实时更新 ResultPanel

**语言自动检测（lang-detect.ts）**
- 统计文本中 CJK 字符（\u4e00-\u9fff）占比
- 占比 > 30% 判定为中文 → 翻译方向 zh→en
- 否则判定为英文 → 翻译方向 en→zh
- 用户也可在底部手动切换语言对覆盖自动检测

**设置管理**
- API Key 存储在 `electron-store`，加密存储
- 首次启动检测到无 API Key 时显示 SettingsModal
- 底部工具栏提供设置入口可随时修改

### Electron 打包
- 使用 electron-builder 打包为 Windows NSIS 安装包 / portable
- 目标：`win` (x64)
- 配置 `electron-builder.yml`

## Affected Files
- 全部为新建文件（空项目）

## Risks
- DeepSeek API 可能变更接口格式 → 使用 OpenAI 兼容格式，适配层薄，易于调整
- 全局快捷键可能与其他软件冲突 → 提供自定义快捷键配置（首期可暂不做，默认 Alt+T）
- electron-store 存储 API Key 安全性 → 后续可迁移至 keytar/safeStorage

## Test Strategy
- 手动测试：快捷键呼出/隐藏、翻译中英双向、置顶切换、API Key 设置
- 可选：使用 Vitest 对 `lang-detect.ts` 和 `translate.ts` 编写单元测试

## RouteSpec Impact
- Need route-sync: no（新项目，尚未创建 route-map）
- Affected routes: N/A

## Acceptance Criteria
1. `Alt+T` 可全局呼出/隐藏翻译窗口
2. 输入中文自动翻译为英文，输入英文自动翻译为中文
3. 翻译结果以流式打字机效果展示
4. 底部可切换置顶和语言对
5. 首次使用引导配置 API Key
6. 打包为 Windows 可执行文件可正常运行
