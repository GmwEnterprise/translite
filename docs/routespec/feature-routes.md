# Feature Route Map

## Project Overview

- Application type: Electron 桌面翻译工具（React + Tailwind）
- Main entry: `electron/main.ts` → `src/main.tsx` → `src/App.tsx`
- Core directories: `electron/`, `src/`
- Test entry: none

## Module Index

- Electron Main: 窗口管理, 全局快捷键, IPC 通信, 翻译引擎
- UI Components: 输入面板, 结果面板, 工具栏, 设置弹窗
- Lib: 语言检测, 翻译调用, 设置存储

## Electron Main

### 窗口管理

- Description: 无边框置顶小窗创建、定位（右上角 420×500）、显隐控制
- Entry: `electron/main.ts:7` (`createWindow`)
- Core: `electron/main.ts:14-29` (BrowserWindow 配置)
- Notes: `close` 事件被拦截为 hide，不退出应用

### 全局快捷键

- Description: `Alt+T` 全局呼出/隐藏翻译窗口
- Entry: `electron/main.ts:53` (`globalShortcut.register`)
- Core: `electron/main.ts:53-61`

### IPC 通信

- Description: preload 暴露 `window.api`，主进程注册 IPC handlers
- Entry: `electron/preload.ts` (contextBridge 暴露 API)
- Core: `electron/ipc-handlers.ts`
- Notes: 通道包括 `store:get/set`, `window:setAlwaysOnTop`, `window:close`, `translate:start/chunk/done/error/abort`

### 翻译引擎

- Description: 调用 DeepSeek Chat Completions API，SSE 流式返回翻译结果
- Entry: `electron/ipc-handlers.ts:24` (`translate:start` handler)
- Core: `electron/ipc-handlers.ts:34-100` (fetch + SSE 解析)
- Notes: model `deepseek-chat`，AbortController 支持取消

## UI Components

### 输入面板

- Description: textarea 输入区，Enter 触发翻译
- Entry: `src/components/InputPanel.tsx`
- Core: `src/App.tsx:87` (使用处)

### 结果面板

- Description: 翻译结果展示 + 流式打字光标 + 复制按钮
- Entry: `src/components/ResultPanel.tsx`
- Core: `src/App.tsx:88`

### 工具栏

- Description: 底部工具栏 — 置顶开关、语言对切换（自动/中→英/英→中）、设置入口
- Entry: `src/components/Toolbar.tsx`
- Core: `src/App.tsx:89-95`

### 标题栏

- Description: 可拖拽标题栏 + 关闭按钮（hide 窗口）
- Entry: `src/components/TitleBar.tsx`

### 设置弹窗

- Description: DeepSeek API Key 输入/保存弹窗，首次启动自动弹出
- Entry: `src/components/SettingsModal.tsx`
- Core: `src/App.tsx:96-102`

## Lib

### 语言检测

- Description: CJK 字符占比 >30% 判定为中文，否则英文
- Entry: `src/lib/lang-detect.ts`

### 翻译调用

- Description: 封装 `window.api.translate` 的流式调用，回调 onChunk
- Entry: `src/lib/translate.ts`

### 设置存储

- Description: 封装 electron-store 的 IPC 读写
- Entry: `src/lib/store.ts`

### 类型声明

- Description: `window.api` 的 TypeScript 类型声明
- Entry: `src/types/global.d.ts`
