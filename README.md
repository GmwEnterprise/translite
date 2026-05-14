# Translite

基于 Electron 的轻量级 AI 翻译工具，使用 OpenAI 兼容 API 实现高质量翻译。

## 功能特性

- **AI 驱动翻译** — 接入任意 OpenAI 兼容 API（如 DeepSeek），支持流式输出
- **多语言支持** — 中文、英语、日语、韩语、法语、德语
- **全局快捷键** — 默认 `Alt+1` 呼出/隐藏窗口，可自定义
- **自动粘贴** — 通过快捷键唤起时自动读取剪贴板内容
- **窗口置顶** — 可切换始终置顶模式
- **系统托盘** — 关闭窗口后最小化到托盘，也可设置为直接退出
- **窗口记忆** — 自动记住窗口位置和大小
- **深色/浅色主题** — 支持主题切换

## 技术栈

- **Electron** + **React** + **Tailwind CSS** + **TypeScript**
- 使用 [electron-vite](https://electron-vite.org/) 构建
- 使用 [electron-builder](https://www.electron.build/) 打包

## 开始使用

### 环境要求

- Node.js >= 18
- pnpm

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 类型检查

```bash
pnpm typecheck
```

### 构建 Windows 安装包

```bash
pnpm build:win
```

构建产物输出到 `release/` 目录。

## 配置

首次启动时会弹出设置窗口，需要填写：

| 配置项 | 说明 |
|--------|------|
| API Base URL | OpenAI 兼容 API 地址（如 `https://api.deepseek.com/v1`） |
| API Key | 对应的 API 密钥 |
| Model | 使用的模型名称（如 `deepseek-v4-flash`） |

也可通过标题栏菜单随时修改设置。

## 目录结构

```
src/
├── main/                    # 主进程
│   ├── index.ts             # 窗口管理、全局快捷键、托盘
│   ├── ipc-handlers.ts      # IPC 通信处理
│   └── translate/           # 翻译引擎
│       ├── index.ts         # 翻译源注册
│       ├── types.ts         # 类型定义
│       └── sources/
│           └── openai-compatible.ts  # OpenAI 兼容翻译源
├── preload/                 # 预加载脚本
│   ├── index.ts
│   └── index.d.ts           # 类型声明
└── renderer/                # 渲染进程
    └── src/
        ├── App.tsx          # 主应用组件
        ├── main.tsx         # 入口
        ├── components/      # UI 组件
        └── lib/             # 工具函数
```

## 许可证

MIT
