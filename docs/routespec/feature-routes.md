# Feature Route Map

## Project Overview

- Application type: Electron 桌面翻译工具（React + Tailwind）
- Build tool: electron-vite
- Main entry: `src/main/index.ts` → `src/renderer/src/main.tsx` → `src/renderer/src/App.tsx`
- Core directories: `src/main/`, `src/preload/`, `src/renderer/src/`
- Test entry: none

## Module Index

- Electron Main: 窗口管理, 全局快捷键, IPC 通信, 翻译引擎
- UI Components: 输入面板, 结果面板, 工具栏, 设置弹窗
- Lib: 语言检测, 翻译调用, 设置存储

## Electron Main

### 窗口管理

- Description: 无边框置顶小窗创建、右下偏中默认定位、窗口位置/大小持久化、最小尺寸、关闭行为选择、托盘显隐控制
- Entry: `src/main/index.ts:7` (`getDefaultBounds` / `createWindow`)
- Core: `src/main/index.ts:7-100` (BrowserWindow 配置、窗口 bounds 存储、托盘与关闭行为)
- Notes: 窗口 bounds 存储在 electron-store 的 `windowBounds`；关闭行为存储在 `closeBehavior`

### 全局快捷键

- Description: `Alt+T` 全局呼出/隐藏翻译窗口
- Entry: `src/main/index.ts:53` (`globalShortcut.register`)
- Core: `src/main/index.ts:53-61`

### IPC 通信

- Description: preload 暴露 `window.api`，主进程注册 IPC handlers
- Entry: `src/preload/index.ts` (contextBridge 暴露 API)
- Core: `src/main/ipc-handlers.ts`
- Notes: 通道包括 `store:get/set`, `window:setAlwaysOnTop`, `window:close`, `window:quit`, `translate:start/chunk/done/error/abort`

### 翻译引擎

- Description: 调用 DeepSeek Chat Completions API，按配置语言对生成自动双向翻译提示词，SSE 流式返回翻译结果
- Entry: `src/main/ipc-handlers.ts:24` (`translate:start` handler)
- Core: `src/main/ipc-handlers.ts:34-100` (fetch + SSE 解析)
- Notes: model `deepseek-chat`，支持中/英/日/韩/法/德语言名称映射，AbortController 支持取消

## UI Components

### 输入面板

- Description: textarea 输入区，Enter 触发翻译
- Entry: `src/renderer/src/components/InputPanel.tsx`
- Core: `src/renderer/src/App.tsx:87` (使用处)

### 结果面板

- Description: 翻译结果展示 + 流式打字光标 + 复制按钮
- Entry: `src/renderer/src/components/ResultPanel.tsx`
- Core: `src/renderer/src/App.tsx:88`

### 工具栏

- Description: 底部工具栏 — 置顶开关
- Entry: `src/renderer/src/components/Toolbar.tsx`
- Core: `src/renderer/src/App.tsx:89-95`

### 标题栏

- Description: 可拖拽标题栏 + 左上角菜单（设置 API Key、设置语言、设置关闭行为、退出应用）+ 关闭按钮
- Entry: `src/renderer/src/components/TitleBar.tsx`

### 语言设置弹窗

- Description: 设置默认互译语言对（英语、日语、韩语、中文、法语、德语），持久化到 electron-store 的 `languagePair`
- Entry: `src/renderer/src/components/LanguageSettingsModal.tsx`
- Core: `src/renderer/src/App.tsx` (读取/保存 `languagePair`，翻译时按语言对自动双向翻译)

### 关闭行为弹窗

- Description: 选择关闭到托盘或退出应用，并持久化到 electron-store
- Entry: `src/renderer/src/components/CloseBehaviorModal.tsx`
- Core: `src/renderer/src/App.tsx` (读取/保存 `closeBehavior` 并调用 `window:close`)

### 设置弹窗

- Description: DeepSeek API Key 输入/保存弹窗，首次启动自动弹出
- Entry: `src/renderer/src/components/SettingsModal.tsx`
- Core: `src/renderer/src/App.tsx:96-102`

## Lib

### 语言检测

- Description: CJK 字符占比 >30% 判定为中文，否则英文
- Entry: `src/renderer/src/lib/lang-detect.ts`

### 翻译调用

- Description: 封装 `window.api.translate` 的流式调用，回调 onChunk
- Entry: `src/renderer/src/lib/translate.ts`

### 设置存储

- Description: 封装 electron-store 的 IPC 读写
- Entry: `src/renderer/src/lib/store.ts`

### 类型声明

- Description: `window.api` 的 TypeScript 类型声明
- Entry: `src/preload/index.d.ts`
