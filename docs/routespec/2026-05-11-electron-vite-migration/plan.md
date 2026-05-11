# Execution Plan: electron-vite-migration

## Summary
将 translite 项目从手动 vite+tsc 并发模式迁移到 electron-vite 统一管理，参照 wiki-reader 项目组织方式。

## Tasks
- [ ] T1: 创建新目录结构并迁移源文件
  - Files: `electron/*` → `src/main/*`, `src/preload/*`; `src/*` → `src/renderer/src/*`; `index.html` → `src/renderer/index.html`
  - Change:
    - 创建 `src/main/`, `src/preload/`, `src/renderer/src/` 目录
    - 移动 `electron/main.ts` → `src/main/index.ts`
    - 移动 `electron/ipc-handlers.ts` → `src/main/ipc-handlers.ts`
    - 移动 `electron/preload.ts` → `src/preload/index.ts`
    - 移动 `src/types/global.d.ts` → `src/preload/index.d.ts`
    - 移动 `src/main.tsx` → `src/renderer/src/main.tsx`
    - 移动 `src/App.tsx` → `src/renderer/src/App.tsx`
    - 移动 `src/components/*` → `src/renderer/src/components/*`
    - 移动 `src/lib/*` → `src/renderer/src/lib/*`
    - 移动 `src/styles/*` → `src/renderer/src/styles/*`
    - 移动 `index.html` → `src/renderer/index.html`
    - 删除空的旧目录 (`electron/`, `src/types/`)
  - Verify: 目录结构与 wiki-reader 一致
  - Depends on: none

- [ ] T2: 适配源代码中的路径引用
  - Files: `src/main/index.ts`, `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/main.tsx`
  - Change:
    - `src/main/index.ts`: preload 路径改为 `join(__dirname, '../preload/index.js')`, HTML 加载改为 `join(__dirname, '../renderer/index.html')`, 添加 `electronApp.setAppUserModelId`
    - `src/preload/index.ts`: 添加 contextIsolated 兼容写法（参照 wiki-reader 模式）
    - `src/preload/index.d.ts`: 更新类型声明格式
    - `src/renderer/src/main.tsx`: CSS import 路径保持不变（相对路径不变）
  - Verify: 无路径错误
  - Depends on: T1

- [ ] T3: 创建 electron.vite.config.ts，删除 vite.config.ts
  - Files: `electron.vite.config.ts` (new), `vite.config.ts` (delete)
  - Change:
    - 删除 `vite.config.ts`
    - 创建 `electron.vite.config.ts`，配置 main ({}), preload ({}), renderer (plugins: [react(), tailwindcss()])
  - Verify: 配置文件语法正确
  - Depends on: none

- [ ] T4: 重写 TypeScript 配置
  - Files: `tsconfig.json`, `tsconfig.node.json`, `tsconfig.web.json` (new)
  - Change:
    - `tsconfig.json`: 改为 references 模式，引用 tsconfig.node.json 和 tsconfig.web.json
    - `tsconfig.node.json`: extends `@electron-toolkit/tsconfig/tsconfig.node.json`，include `electron.vite.config.*`, `src/main/**/*`, `src/preload/**/*`
    - `tsconfig.web.json`: extends `@electron-toolkit/tsconfig/tsconfig.web.json`，include `src/renderer/src/**/*`, `src/preload/*.d.ts`
  - Verify: 类型检查通过
  - Depends on: T1

- [ ] T5: 更新 package.json (scripts + dependencies)
  - Files: `package.json`
  - Change:
    - 移除 devDeps: `concurrently`, `wait-on`, `cross-env`
    - 新增 devDeps: `electron-vite`, `@electron-toolkit/preload`, `@electron-toolkit/utils`, `@electron-toolkit/tsconfig`
    - `main` 改为 `./out/main/index.js`
    - scripts: dev=`electron-vite dev`, build=`electron-vite build`, start=`electron-vite preview`, typecheck 拆为 node+web
    - 移除不再需要的 scripts (build:renderer, build:electron)
  - Verify: `pnpm install` 成功
  - Depends on: none

- [ ] T6: 更新 electron-builder.yml
  - Files: `electron-builder.yml`
  - Change:
    - files 列表更新为 electron-vite 输出路径
    - directories.output 改为 `dist` 或保持 `release`
    - 移除 extraMetadata.main (main 字段已在 package.json 中)
  - Verify: 构建配置正确
  - Depends on: none

- [ ] T7: 清理旧产物和文件
  - Files: `dist-electron/`, `dist/`, 旧的空目录
  - Change:
    - 删除 `dist-electron/` 目录（旧构建产物）
    - 确认 `electron/` 目录已清空并删除
  - Verify: 无残留旧文件
  - Depends on: T1

## Verification
- Commands: `pnpm install` && `pnpm typecheck` (在宿主机执行)
- Manual checks: `pnpm dev` 能启动，翻译功能正常

## Task Relationships
- Strongly related: T1 + T2 (同一批文件的移动和路径适配，应合并执行)
- Weakly related: T3 + T4 + T5 + T6 (配置文件更新，可并行但需最终一致性)
- Independent: T7 (纯清理，最后执行)
- Conflict risks: T5 中 pnpm install 需在配置文件都就绪后执行

## RouteSync
- Need route-sync: yes
- Expected updates: 所有条目的文件路径需更新

## Risks
- `@tailwindcss/vite` 需在 renderer plugins 中正确配置
- `@electron-toolkit/tsconfig` 可能需要较低版本的 TypeScript（需验证兼容性）
