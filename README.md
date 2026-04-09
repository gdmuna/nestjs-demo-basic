<div align="center">

<h1>NestJS Scaffold</h1>

<p align="center">
  NestJS 后端基线模板——认证系统、分层架构、CI 流水线、容器化部署、结构化日志、开箱即用
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/pnpm-8.x-F69220?logo=pnpm&logoColor=white" alt="pnpm" />
  <img src="https://img.shields.io/badge/License-MIT-success?logo=opensourceinitiative&logoColor=white" alt="License" />
</p>

</div>

NestJS 后端开发基线模板，提供认证系统（JWT ES256 双令牌）、分层架构、AOP 切面、结构化日志、类型安全异常体系、OpenAPI 自动富化、CI/CD 流水线，以及以**Harness Engineering**为核心的 AI 协作设计，开箱即用。

## 文档站

| 文档站 | 说明 |
|--------|------|
| [文档站（main 分支）](<!-- 请填写 main 分支文档站链接 -->) | 跟踪 `main` 分支（最新稳定版） |
| [文档站（dev 分支）](<!-- 请填写 dev 分支文档站链接 -->) | 跟踪 `dev` 分支（最新开发版） |

## 文档

完整文档见 **[docs/](docs/)** 目录，建议从以下入口开始：

- **[快速上手](docs/00-getting-started/quick-start.md)** — 5 分钟将项目跑起来
- **[项目简介](docs/00-getting-started/introduction.md)** — 了解架构设计和核心特性
- **[环境搭建](docs/01-guides/environment-setup.md)** — 完整的本地开发环境配置

## 快速开始

```bash
# 1. 克隆项目并安装依赖
git clone https://github.com/gdmuna/nestjs-demo-basic.git && cd nestjs-demo-basic
pnpm install

# 2. 配置环境变量（将 .env.keys 放置到项目根目录）

# 3. 初始化数据库
pnpm db:gen-client && pnpm db:migrate

# 4. 启动开发服务器
pnpm start:dev
```

健康检查：`curl http://localhost:3000/health`

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm start:dev` | 热重载开发服务器 |
| `pnpm build` | 编译（tsc + tsc-alias）|
| `pnpm test` | 单元测试 + E2E 测试 |
| `pnpm lint:fix` | ESLint 自动修复 |
| `pnpm db:migrate` | 数据库迁移 |
| `pnpm db:gen-client` | 重新生成 Prisma Client |
| `pnpm docs:dev` | 启动文档站开发服务器 |

## 依赖

| 依赖 | 版本要求 |
|------|---------|
| Node.js | ≥ 22.0.0 |
| pnpm | ≥ 8.0.0 |
| PostgreSQL | ≥ 18 |

## License

MIT
