# NestJS Demo Basic

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript) ![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma) ![pnpm](https://img.shields.io/badge/pnpm-8.x-F69220?logo=pnpm) ![License](https://img.shields.io/badge/License-MIT-green)

**一个生产就绪的 NestJS 后端开发模板**

提供完整的 CI/CD 工作流、代码质量工具链、版本管理和数据库集成

[快速开始](#快速开始) • [文档](#详细文档) • [CI/CD](#cicd-工作流) • [贡献指南](#贡献指南)

</div>

---

## ✨ 特性

### 核心功能

- 🚀 **NestJS 11.x** - 渐进式 Node.js 框架
- 📘 **TypeScript** - 类型安全的 JavaScript
- 🗄️ **Prisma** - 下一代 ORM
- 🐘 **PostgreSQL** - 主数据库支持
- 🐳 **Docker** - 容器化部署

### 开发体验

- ⚡ **热重载** - 开发模式自动重启
- 🧪 **Jest** - 单元测试与 E2E 测试
- 🎨 **ESLint + Prettier** - 代码格式化
- 📝 **Commitlint** - 规范化提交信息
- 🪝 **Husky** - Git 钩子管理

### CI/CD

- 🔄 **自动化发布** - Release 分支自动打标签
- 📸 **快照版本** - 测试环境快照发布
- ✅ **自动化测试** - Feature/Release 分支 CI 检查
- 🚀 **部署流程** - Dev/Prod 环境自动部署

## 📋 前提条件

- **Node.js** >= 20.0.0
- **pnpm** >= 8.0.0
- **PostgreSQL** >= 15.0（可选，用于数据库功能）
- **Docker**（可选，用于容器化部署）

## 🚀 快速开始

### 1. 从模板创建项目

```bash
# 使用 GitHub "Use this template" 按钮，或直接克隆
git clone https://github.com/your-username/nestjs-demo-basic.git my-project
cd my-project
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
NODE_ENV=development
PORT=3000
DB_URL=postgresql://username:password@localhost:5432/mydb?schema=public
```

### 4. 初始化数据库

```bash
# 生成 Prisma Client
pnpm prisma generate

# 运行数据库迁移
pnpm prisma migrate dev

# （可选）查看数据库
pnpm prisma studio
```

### 5. 启动开发服务器

```bash
pnpm start:dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 📚 详细文档

### 目录结构

```
nestjs-demo-basic/
├── .github/
│   ├── workflows/              # GitHub Actions 工作流
│   │   ├── auto-tag-release.yaml
│   │   ├── release-snapshot.yaml
│   │   ├── ci-feature.yaml
│   │   ├── ci-release.yaml
│   │   ├── ci-cd-dev.yaml
│   │   └── ci-cd-prod.yaml
│   └── copilot-instructions.md # AI 编码助手指令
├── prisma/
│   ├── schema.prisma          # 数据库模型定义
│   └── migrations/            # 数据库迁移文件
├── scripts/
│   └── auto-tag-release.cjs   # 自动标签发布脚本
├── src/
│   ├── common/                # 共享服务
│   │   └── prisma.service.ts
│   ├── utils/                 # 工具函数
│   ├── app.module.ts          # 根模块
│   ├── app.controller.ts      # 示例控制器
│   ├── app.service.ts         # 示例服务
│   └── main.ts                # 应用入口
├── test/                      # 测试文件
│   ├── unit/                  # 单元测试
│   └── e2e/                   # E2E 测试
├── .env.example               # 环境变量模板
├── .husky/                    # Git 钩子
├── commitlint.config.js       # 提交信息规范
├── Dockerfile                 # Docker 镜像
├── package.json               # 项目配置
└── README.md                  # 项目文档
```

### 可用命令

#### 开发命令

```bash
pnpm start:dev      # 开发模式（热重载）
pnpm start:prod     # 生产模式
pnpm build          # 构建项目
```

#### 代码质量

```bash
pnpm lint           # 代码检查
pnpm lint:fix       # 修复代码问题
pnpm format         # 格式化代码
pnpm commit         # 交互式提交（规范化）
```

#### 测试

```bash
pnpm test           # 运行单元测试
pnpm test:watch     # 监听模式测试
pnpm test:cov       # 测试覆盖率
pnpm test:e2e       # E2E 测试
```

#### 数据库

```bash
pnpm prisma generate      # 生成 Prisma Client
pnpm prisma migrate dev   # 运行迁移（开发）
pnpm prisma migrate deploy # 运行迁移（生产）
pnpm prisma studio        # 数据库可视化界面
```

### API 接口

| 方法 | 路径      | 描述     | 响应示例                                          |
| ---- | --------- | -------- | ------------------------------------------------- |
| GET  | `/`       | 欢迎消息 | `"Hello World!"`                                  |
| GET  | `/health` | 健康检查 | `{"status": "ok", "timestamp": "2025-12-21T..."}` |

### 环境变量

| 变量名     | 描述           | 默认值        | 必需 |
| ---------- | -------------- | ------------- | ---- |
| `NODE_ENV` | 运行环境       | `development` | 否   |
| `PORT`     | 服务端口       | `3000`        | 否   |
| `DB_URL`   | 数据库连接 URL | -             | 是\* |

\*仅在使用数据库功能时必需

## 🔄 CI/CD 工作流

### 工作流架构

```mermaid
graph TB
    subgraph "Feature Development"
        A[Feature Branch] -->|Push| B[ci-feature.yaml]
        B -->|Lint + Build| C{Pass?}
        C -->|Yes| D[Ready for PR]
        C -->|No| E[Fix Issues]
        E --> A
    end

    subgraph "Release Process"
        F[Release Branch] -->|Push| G[ci-release.yaml]
        G -->|Full CI + Tests| H{Pass?}
        H -->|Yes| I[Merge to Main]
        H -->|No| J[Fix Issues]
        J --> F

        F -->|Commit with [snapshot]| K[release-snapshot.yaml]
        K -->|Create Snapshot Tag| L[v0.3.0-snapshot-...]
    end

    subgraph "Deployment"
        I -->|Auto Trigger| M[auto-tag-release.yaml]
        M -->|Calculate Next Version| N[Update package.json]
        N -->|Create Tag| O[v0.3.2]
        O -->|Trigger| P[ci-cd-prod.yaml]
        P -->|Deploy| Q[Production]
    end

    subgraph "Development Deploy"
        D -->|Merge to Dev| R[ci-cd-dev.yaml]
        R -->|Deploy| S[Dev Environment]
    end
```

### 提交信息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**支持的类型：**

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具变更
- `ci`: CI 配置
- `build`: 构建系统
- `release`: 版本发布

**示例：**

```bash
# 使用交互式提交助手（推荐）
pnpm commit

# 或手动编写
git commit -m "feat(user): add user registration endpoint"
git commit -m "fix(auth): resolve token expiration issue"
git commit -m "docs(readme): update installation guide"
```

### 版本管理流程

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant RB as Release Branch
    participant Main as Main Branch
    participant GH as GitHub Actions
    participant Tag as Git Tag

    Dev->>RB: Create release-0.3
    Dev->>RB: Commit changes
    Dev->>RB: Push with [snapshot]
    RB->>GH: Trigger release-snapshot
    GH->>Tag: Create v0.3.0-snapshot-20251221-abc1234

    Dev->>Main: Create PR (release-0.3 → main)
    Dev->>Main: Merge PR
    Main->>GH: Trigger auto-tag-release
    GH->>GH: Find latest v0.3.x tag
    GH->>GH: Calculate next patch (v0.3.1 → v0.3.2)
    GH->>Main: Update package.json
    GH->>Tag: Create v0.3.2
    Tag->>GH: Trigger ci-cd-prod
    GH->>GH: Deploy to Production
```

## 🐳 Docker 部署

### 构建镜像

```bash
docker build -t nestjs-demo-basic:latest .
```

### 运行容器

```bash
docker run -d \
  -p 3000:3000 \
  -e DB_URL="postgresql://user:pass@host:5432/db" \
  nestjs-demo-basic:latest
```

### Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
    app:
        build: .
        ports:
            - '3000:3000'
        environment:
            - NODE_ENV=production
            - DB_URL=postgresql://postgres:password@db:5432/mydb
        depends_on:
            - db

    db:
        image: postgres:15-alpine
        environment:
            - POSTGRES_DB=mydb
            - POSTGRES_USER=postgres
            - POSTGRES_PASSWORD=password
        volumes:
            - postgres_data:/var/lib/postgresql/data

volumes:
    postgres_data:
```

运行：

```bash
docker-compose up -d
```

## 🤝 贡献指南

### 开发流程

```mermaid
flowchart LR
    A[Fork Repository] --> B[Create Feature Branch]
    B --> C[Make Changes]
    C --> D[Run Tests]
    D --> E{Tests Pass?}
    E -->|No| C
    E -->|Yes| F[Commit Changes]
    F --> G[Push to Fork]
    G --> H[Create Pull Request]
    H --> I[Code Review]
    I --> J{Approved?}
    J -->|No| C
    J -->|Yes| K[Merge to Main]
```

### 分支策略

- `main` - 稳定的生产代码
- `dev` - 日常开发集成
- `feature/*` - 新功能开发
- `bugfix/*` - Bug 修复
- `release-X.Y` - 版本发布

### 提交 PR 前检查

- [ ] 代码通过 lint 检查（`pnpm lint`）
- [ ] 所有测试通过（`pnpm test`）
- [ ] 代码已格式化（`pnpm format`）
- [ ] 提交信息符合规范（使用 `pnpm commit`）
- [ ] 更新相关文档

## 📖 技术栈详解

### 核心技术

| 技术       | 版本 | 用途       |
| ---------- | ---- | ---------- |
| NestJS     | 11.x | 渐进式框架 |
| TypeScript | 5.x  | 类型系统   |
| Prisma     | 7.x  | ORM        |
| PostgreSQL | 15+  | 数据库     |
| pnpm       | 8+   | 包管理器   |

### 开发工具

| 工具       | 用途         |
| ---------- | ------------ |
| ESLint     | 代码检查     |
| Prettier   | 代码格式化   |
| Commitlint | 提交信息验证 |
| Husky      | Git 钩子     |
| Jest       | 测试框架     |
| Supertest  | HTTP 测试    |

## 🔧 故障排查

### 常见问题

#### 1. pnpm 命令不存在

```bash
npm install -g pnpm@latest
```

#### 2. Prisma Client 未生成

```bash
pnpm prisma generate
```

#### 3. 数据库连接失败

- 检查 `.env` 中的 `DB_URL` 是否正确
- 确保 PostgreSQL 服务已启动
- 验证数据库凭据和网络连接

#### 4. 端口已被占用

```bash
# 修改 .env 中的 PORT
PORT=4000

# 或查找占用端口的进程
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

#### 5. Commit 被拒绝

提交信息不符合规范，使用交互式助手：

```bash
pnpm commit
```

## 📝 更新日志

查看完整的更新历史：

- [CHANGELOG.md](CHANGELOG.md) - 英文版
- [CHANGELOG_zh-CN.md](CHANGELOG_zh-CN.md) - 中文版

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🙏 致谢

- [NestJS](https://nestjs.com/) - 优秀的 Node.js 框架
- [Prisma](https://www.prisma.io/) - 现代化的 ORM
- [pnpm](https://pnpm.io/) - 高效的包管理器

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐️**

Made with ❤️ by [Your Name]

</div>
