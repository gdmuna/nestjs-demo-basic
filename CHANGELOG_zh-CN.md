# 更新日志

本文件记录了项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.4.2] - 2025-12-23

### ⚡ CI/CD 改进

#### PAT Token 支持跨工作流触发

- **auto-tag-release.yaml 增强**：添加 Personal Access Token (PAT) 支持，以触发 cd-prod.yaml 工作流
    - 添加详细的文档注释，说明 GitHub Actions 安全限制
    - 配置使用仓库 Secrets 中的 `PAT_TOKEN`（如未配置则回退到 `GITHUB_TOKEN`）
    - 更新 checkout 步骤使用 PAT token
    - 更新 Git 凭证配置使用 PAT token
    - **背景说明**：GitHub Actions 默认的 `GITHUB_TOKEN` 推送标签/代码时不会触发其他工作流（防止无限递归）

### 📚 文档更新

#### PAT 配置指南

- **新增文档文件**：创建 `docs/github-pat-setup.md`，详细说明 PAT 配置步骤
    - 创建 Fine-grained Personal Access Token 的分步指南
    - 仓库 Secrets 配置说明
    - 安全最佳实践和 token 管理指南
    - 故障排查和常见问题解答

- **README.md 增强**：在 CI/CD 工作流文档中添加 PAT 配置章节
    - 添加关于 GitHub Actions 安全限制的警告说明
    - 快速配置指南（3 分钟配置）
    - 未配置 PAT 的影响说明
    - 链接到详细配置文档

### 🔧 技术细节

#### 文件变更统计

```
3 个文件变更，52 行新增(+)，2 行删除(-)
```

#### 修改的文件

- `.github/workflows/auto-tag-release.yaml` (+19 行)
- `README.md` (+33 行)
- `package.json` (版本号：0.4.1 → 0.4.2)

---

## [0.4.1] - 2025-12-23

### ⚡ CI/CD 改进

#### 生产部署工作流增强

- **cd-prod.yaml 增强**：添加手动触发功能，支持自定义标签输入
    - 添加 `workflow_dispatch` 触发器，允许手动部署
    - 添加 `tag` 输入参数（如 v0.4.0），用于指定部署目标
    - 更新 checkout 步骤，同时支持自动触发（标签推送）和手动触发（workflow_dispatch）
    - 增强标签提取逻辑，处理两种触发类型
    - **使用场景**：PAT 未配置时的手动部署，或紧急部署场景

#### CI 工作流数据库测试支持

- **ci-prod.yaml 增强**：添加 PostgreSQL 服务容器用于测试
    - 配置 PostgreSQL 18.1-alpine 服务容器
    - 设置容器健康检查以确保就绪
    - 通过环境变量配置测试数据库凭证
    - 端口映射：5432:5432 用于本地访问
    - **用途**：在 CI 环境中运行需要数据库连接的测试

### 🔧 技术细节

#### 文件变更统计

```
3 个文件变更，32 行新增(+)，2 行删除(-)
```

#### 修改的文件

- `.github/workflows/cd-prod.yaml` (+14 行)
- `.github/workflows/ci-prod.yaml` (+18 行)
- `package.json` (版本号：0.4.0 → 0.4.1)

---

## [0.4.0] - 2025-12-23

### 🔒 安全修复

#### 命令注入漏洞修复

- **version-utils.cjs 命令注入防护**：使用 `execFileSync` 代替 `execSync`，通过参数数组传递避免 shell 注入
    - 添加 `validateVersionPrefixFormat()` 函数，严格验证版本前缀格式（只允许 `X.Y`）
    - 新增 `execGit()` 函数，安全地执行 git 命令
    - 修复 `getExistingTags()` 使用不安全的 shell 命令拼接问题

#### Workflow 脚本注入防护

- **用户输入转义**：所有 workflow 中的用户可控输入添加转义处理
    - PR 标题、分支名、提交信息等通过环境变量传递，避免直接插值
    - 移除换行符并转义反引号，防止破坏 Markdown 格式
    - 影响文件：`auto-tag-release.yaml`、`pr-check-dev.yaml`、`pr-check-prod.yaml`、`ci-release.yaml`、`release-snapshot.yaml`

#### 变量引用规范化

- **统一 git 命令变量引用**：`auto-tag-release.yaml` 中所有 `git rev-list` 命令的 `TAG_NAME` 变量统一加引号（`"${TAG_NAME}"`）

### ⚡ CI/CD 改进

#### Workflow 架构重构

- **并行 Job 执行**：所有 workflow 重构为独立并行 job，提升执行效率
    - `pr-check-dev.yaml`：拆分为 `lint-and-format` + `test`
    - `pr-check-prod.yaml`：拆分为 `lint-and-format` + `test` + `check-version`（条件执行）
    - `ci-feature.yaml`：拆分为 `lint-and-format` + `test`
    - `ci-release.yaml`：拆分为 `lint-and-format` + `test` + `check-version`
    - `ci-cd-dev.yaml`：拆分为 `lint-and-format` + `test` + `build-and-publish`

#### 生产环境 CI/CD 分离

- **ci-cd-prod.yaml 拆分**：
    - `ci-prod.yaml`：CI 流程（main 分支 push 触发，仅 lint + test）
    - `cd-prod.yaml`：CD 流程（v\* tag 触发，负责 Docker 构建和发布）

#### Docker 镜像标签策略简化

- **标签数量优化**：从 5+ 个标签简化为 3 个
    - 开发环境：`dev-latest`、`dev-YYYYMMDD-hash`、版本号
    - 生产环境：`prod-latest`、`prod-YYYYMMDD-hash`、版本号
- **移除冗余标签**：删除 `image-tag-version` 输出和相关生成逻辑

#### 版本管理脚本

- **scripts/validate-version.cjs**：PR 版本验证脚本
    - 检查 package.json 版本是否匹配 release 分支
    - 生成中英双语验证结果评论
    - 支持 `BRANCH_NAME` 环境变量传参（防止命令注入）

- **scripts/validate-release-version.cjs**：Release 分支版本验证
    - 提取 release 分支版本前缀（如 `release-0.4` → `0.4`）
    - 验证 package.json 版本是否为 `X.Y` 格式

- **scripts/generate-snapshot-info.cjs**：快照版本信息生成
    - 替换原 bash 脚本，使用 JavaScript 实现
    - 输出：version、sha7、timestamp、snapshot_tag、docker_image_snapshot_tag

- **scripts/create-release-tag.cjs**：自动创建 Release 标签
    - 验证版本号有效性
    - 计算下一个 patch 版本
    - 创建 tag（不推送，由 workflow 推送）
    - 支持 `RELEASE_BRANCH`/`BRANCH_NAME` 环境变量

- **scripts/version-utils.cjs**：版本管理通用工具库
    - `extractVersionPrefix()`：提取版本前缀并验证
    - `getExistingTags()`：安全获取现有 tag 列表
    - `calculateNextPatch()`：计算下一个 patch 号
    - `validatePackageVersion()`：验证 package.json 版本

#### PR 评论优化

- **自动清理旧评论**：`pr-check-prod.yaml` 自动删除旧的版本检查评论
    - 通过 HTML 注释标识符 `<!-- version-check-comment -->` 识别
    - 只删除 `github-actions[bot]` 发表的评论，避免误删

#### 其他改进

- **Node.js 版本显式指定**：`release-snapshot.yaml` 添加 `setup-node` 步骤，确保使用 Node.js 22
- **修复语法错误**：移除 `release-snapshot.yaml` 中多余的 echo 语句
- **workflow 触发条件优化**：`auto-tag-release.yaml` 移除命令行参数，直接使用环境变量

### 📚 文档更新

#### Commitlint 相关清理

- **移除 Commitlint 引用**：从文档中移除已删除工具的引用
    - 更新 `README.md`：删除 5 处 Commitlint 提及
    - 更新 `.github/copilot-instructions.md`：移除技术栈中的 Commitlint
    - 说明：提交信息规范仍推荐遵循，但不再通过 Git hooks 强制验证

#### 项目说明完善

- **更新核心特性描述**：突出 CI/CD 工作流、版本管理等核心能力

### 🗑️ 移除

#### 工具链简化

- **删除 Commitlint 配置**：
    - 删除 `commitlint.config.js`
    - 删除 `.husky/commit-msg` Git 钩子
    - 从 `package.json` 移除 `@commitlint/cli` 和 `@commitlint/config-conventional` 依赖

### 📦 依赖变更

- 移除 `@commitlint/cli` (v20.2.0)
- 移除 `@commitlint/config-conventional` (v20.2.0)

### 🔧 技术细节

#### 文件变更统计

```
21 files changed, 2358 insertions(+), 449 deletions(-)
```

#### 新增文件

- `scripts/validate-version.cjs` (114 行)
- `scripts/validate-release-version.cjs` (127 行)
- `scripts/generate-snapshot-info.cjs` (85 行)
- `scripts/create-release-tag.cjs` (88 行)
- `scripts/version-utils.cjs` (185 行)
- `.github/workflows/ci-prod.yaml` (148 行)
- `.github/workflows/cd-prod.yaml` (105 行)

#### 重命名文件

- `.github/workflows/ci-cd-prod.yaml` → `.github/workflows/cd-prod.yaml`

#### 删除文件

- `commitlint.config.js`
- `.husky/commit-msg`

#### 修改文件（主要变更）

- `.github/workflows/auto-tag-release.yaml` (+/-177 行)
- `.github/workflows/pr-check-prod.yaml` (+/-193 行)
- `.github/workflows/ci-release.yaml` (+/-128 行)
- `.github/copilot-instructions.md` (+383 行)
- `README.md` (+551 行)

---

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
