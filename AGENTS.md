## 项目概况

基于 Electron 的轻量翻译工具，使用 electron-vite 构建。

- 技术栈：Electron + React + Tailwind CSS + TypeScript
- 目录结构：`src/main/`（主进程）、`src/preload/`（预加载）、`src/renderer/src/`（渲染进程）
- 构建输出：`out/`

## 环境说明

当前环境为 WSL2，本应用目前为 Win10/11 开发，所以任何构建命令、打包命令，都应直接告诉用户执行命令，由用户手工在宿主机上执行。

## 常用命令

- `pnpm dev` — 启动开发模式
- `pnpm typecheck` — 类型检查
- `pnpm build:win` — 构建 Windows 安装包