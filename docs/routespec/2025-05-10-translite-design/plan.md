# Execution Plan: translite

## Summary
从零搭建 Electron + React + Tailwind 翻译工具，分 6 个任务按依赖顺序执行。

## Tasks

- [ ] T1: 项目脚手架与构建配置
  - Files: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `electron-builder.yml`, `src/styles/index.css`, `src/main.tsx`
  - Change: 初始化 pnpm 项目，安装所有依赖（electron, react, react-dom, tailwindcss, electron-builder, vite, typescript 等），配置 Vite 构建 React 渲染进程，配置 Tailwind CSS，配置 electron-builder 打包。index.html 使用标准的 Vite React 入口。
  - Verify: `pnpm install` 成功，`pnpm dev` 可启动 Vite 开发服务器并渲染空白 React 页面
  - Depends on: none

- [ ] T2: Electron 主进程与 preload
  - Files: `electron/main.ts`, `electron/preload.ts`, `electron/ipc-handlers.ts`
  - Change:
    - `main.ts`: 创建 BrowserWindow（frameless, 420×500, 置顶, 右上角定位），注册全局快捷键 Alt+T toggle 窗口，加载 Vite dev server 或打包后的 index.html
    - `preload.ts`: 通过 contextBridge 暴露 `window.api` 对象，包含 translate、getStore、setStore 方法
    - `ipc-handlers.ts`: 注册 IPC handlers — translate（调用 DeepSeek API 流式返回）、getStore/setStore（electron-store 读写）
  - Verify: `pnpm dev` 启动后 Alt+T 可呼出/隐藏窗口
  - Depends on: T1

- [ ] T3: 工具库 — 语言检测、翻译 API、设置存储
  - Files: `src/lib/lang-detect.ts`, `src/lib/translate.ts`, `src/lib/store.ts`
  - Change:
    - `lang-detect.ts`: `detectLang(text)` — CJK 字符占比 >30% 返回 `'zh'` 否则 `'en'`
    - `translate.ts`: `translateStream(text, from, to, onChunk)` — 通过 IPC 调用主进程的翻译接口，回调 onChunk 实现流式更新
    - `store.ts`: `getStore(key)`, `setStore(key, value)` — 封装 `window.api` 的存储方法
  - Verify: 无独立验证，随 T5 集成验证
  - Depends on: T2（依赖 preload 暴露的 api 接口类型）

- [ ] T4: UI 组件 — InputPanel, ResultPanel, Toolbar, SettingsModal
  - Files: `src/components/InputPanel.tsx`, `src/components/ResultPanel.tsx`, `src/components/Toolbar.tsx`, `src/components/SettingsModal.tsx`, `src/App.tsx`
  - Change:
    - `InputPanel.tsx`: textarea 输入框，支持 Ctrl+Enter 提交
    - `ResultPanel.tsx`: 翻译结果展示区，支持流式文字追加，带复制按钮
    - `Toolbar.tsx`: 底部栏 — 置顶开关（通过 IPC 控制 mainWindow.setAlwaysOnTop）、语言对显示/切换、设置按钮
    - `SettingsModal.tsx`: 弹窗输入 DeepSeek API Key，保存到 store
    - `App.tsx`: 组装以上组件，上下分栏布局，首次加载检测 API Key 决定是否显示 SettingsModal
  - Verify: UI 渲染正常，各组件交互可见
  - Depends on: T1

- [ ] T5: 翻译流程集成 — useTranslate Hook
  - Files: `src/hooks/useTranslate.ts`
  - Change: 自定义 Hook 管理翻译状态（loading/result/error），整合语言检测 + translateStream，支持流式更新结果
  - Verify: 输入中文/英文，回车触发，下方显示翻译结果（流式打字效果）
  - Depends on: T3, T4

- [ ] T6: 打包配置与最终验证
  - Files: `electron-builder.yml`, `package.json`（scripts）
  - Change: 完善 electron-builder.yml（appId, productName, win 配置, files 配置），添加 build script，确保 Vite 构建输出与 Electron 正确对接
  - Verify: `pnpm build` 生成 Windows 可执行文件，双击运行可正常使用
  - Depends on: T5

## Verification
- Commands:
  - `pnpm install` — 依赖安装
  - `pnpm dev` — 开发模式启动
  - `pnpm build` — 打包 Windows 可执行文件
- Manual checks:
  - Alt+T 全局呼出/隐藏
  - 输入中文→英文翻译，输入英文→中文翻译
  - 流式打字效果
  - 置顶开关切换
  - API Key 设置与持久化

## Task Relationships
- Strongly related: T1 + T2（Electron 主进程与构建配置紧密耦合）
- Weakly related: T3 + T4（工具库与 UI 组件可并行开发，但共享 preload 类型定义）
- Independent: T6 仅依赖最终集成
- Conflict risks: T3 和 T4 都需要了解 preload 暴露的 API 类型，建议在 T2 中明确定义类型

## RouteSync
- Need route-sync: no（空项目，无 route-map）
- Expected updates: N/A

## Risks
- electron-vite 与 Vite 原生配置可能有冲突 → T1 中需验证构建流程
- DeepSeek 流式返回格式需与代码中解析逻辑匹配 → T5 中重点验证
