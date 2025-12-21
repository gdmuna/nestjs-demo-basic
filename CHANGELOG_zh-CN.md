# 更新日志

本文件记录了项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.3.1] - 2025-12-21

### 变更

- 发布 0.3.1 版本

## [0.3.0] - 2025-12-20

### 新增

#### GitHub Actions 工作流

- **自动标签发布** (`auto-tag-release.yaml`)：当 release 分支合并到 main 时自动创建版本标签
- **快照版本发布** (`release-snapshot.yaml`)：发布带时间戳的快照版本用于测试
- **特性分支 CI** (`ci-feature.yaml`)：对特性分支运行 CI 检查
- **发布分支 CI** (`ci-release.yaml`)：合并前验证发布分支

#### 代码质量与规范

- **Commitlint**：强制执行提交信息规范
    - 添加 `@commitlint/cli` (v20.2.0)
    - 添加 `@commitlint/config-conventional` (v20.2.0)
    - 添加 `commitlint.config.js` 配置文件，支持以下类型：`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`chore`、`revert`、`ci`、`build`、`release`
- **Commitizen**：交互式提交信息助手
    - 添加 `commitizen` (v4.3.1)
    - 添加 `cz-conventional-changelog` (v3.3.0)
    - 新增 `pnpm commit` 命令用于引导式提交
- **Husky Git 钩子**：commit-msg 钩子在提交前验证提交信息

### 变更

#### 工作流文件重命名（`.yml` → `.yaml`）

- `ci-cd(dev).yml` → `ci-cd-dev.yaml` 并改进格式
- `ci-cd(prod).yml` → `ci-cd-prod.yaml` 并改进格式
- `PR-check(dev).yml` → `pr-check-dev.yaml`
- `PR-check(prod).yml` → `pr-check-prod.yaml`

#### 依赖更新

- **Prisma**：`7.1.0` → `7.2.0`
    - `@prisma/adapter-pg`：`7.1.0` → `7.2.0`
    - `@prisma/client`：`7.1.0` → `7.2.0`
    - `prisma`：`7.1.0` → `7.2.0`
- **ESLint 与 TypeScript**：
    - `@eslint/js`：`9.39.1` → `9.39.2`
    - `eslint`：`9.39.1` → `9.39.2`
- **类型定义**：
    - `@types/node`：`25.0.0` → `25.0.3`

#### 环境变量

- **数据库 URL 重命名**：`DATABASE_URL` → `DB_URL`，涉及文件：
    - `.env.example`
    - `Dockerfile`（ARG 参数）
    - `prisma.config.ts`
    - `src/common/prisma.service.ts`

#### 编辑器配置

- **VS Code 设置**（`.vscode/settings.json`）：
    - 添加 YAML 格式化配置（2 空格缩进）
    - 添加 JSON 格式化配置（2 空格缩进）
    - 移除多余空行，格式更清晰
    - 改进代码组织结构

### 移除

- **过时的工作流**：删除 `ci-cd.yml`（已由独立的 dev/prod 工作流替代）

## [0.2.0] - 2025-12

### 新增

- 初始化 CI/CD 工作流用于开发和生产环境
    - `ci-cd(dev).yml`：开发环境部署工作流
    - `ci-cd(prod).yml`：生产环境部署工作流
    - `PR-check(dev).yml`：开发环境 PR 验证
    - `PR-check(prod).yml`：生产环境 PR 验证
- Dockerfile 用于容器化部署
- VS Code 编辑器配置
