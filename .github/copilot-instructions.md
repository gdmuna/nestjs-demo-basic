## 快速概览

这是一个极简的 NestJS 示例服务。项目结构非常小，主要文件：

- `src/main.ts` - 应用入口，读取 `PORT` 环境变量并启动 HTTP 服务。
- `src/app.module.ts` - 根模块，声明 controllers 和 providers。
- `src/app.controller.ts` - 示例控制器，包含 `/` 和 `/health` 路由。
- `src/app.service.ts` - 示例服务，`AppController` 通过依赖注入调用它。
- `package.json` - 常用脚本（`start:dev`, `build`, `start:prod`）和依赖声明。

## 大局（为什么这么组织）

- 项目采用 NestJS 的约定优于配置：模块（Module）负责组装控制器和服务，控制器处理 HTTP 接口，服务封装业务逻辑。这个仓库刻意保持最小示例，用来演示基本的控制器->服务 数据流（见 `AppController` 调用 `AppService.getHello()`）。
- `nest-cli.json` 指定了 `sourceRoot: "src"`，也说明该仓库遵循 Nest 的默认代码生成与构建流程。

## 关键命令（开发者工作流）

- 安装依赖：`pnpm install`
- 开发（热重载）：`pnpm start:dev`（内部调用 `nest start --watch`）
- 打包：`pnpm build`（使用 `nest build`，输出到 `dist/`）
- 生产启动：先 `pnpm build`，再 `pnpm start:prod`（运行 `node dist/main`）

注意：项目已迁移至 **pnpm** 作为包管理器（参见 `MIGRATION_TO_PNPM.md`）。`.env.example`/`.env` 文件不在仓库中；代理不要假设其存在，除非用户添加。

## 项目约定与可观察的模式（对 AI 很重要的细节）

- 路由定义：使用装饰器 `@Controller()` 和 `@Get()`，方法直接返回数据（例如 `/health` 返回 `{status: 'ok', timestamp: ...}`）。当添加新接口，遵循同样的 controller->service 分层。
- 依赖注入：通过构造函数注入服务（见 `constructor(private readonly appService: AppService) {}`），不要手动 new 实例。
- TypeScript 配置：`tsconfig.json` 输出到 `./dist`，目标为 ES2021。构建和运行依赖 `typescript` 与 `ts-node`（devDependencies）。
- Lint/格式：`package.json` 有 `lint`（eslint）和 `format`（prettier）脚本，但仓库未包含 ESLint/Prettier 配置文件；在修改代码前，注意仓库可能没有统一的规则文件。

## 集成功能与外部依赖

- 运行时只依赖 Node 与 Nest 核心包（见 `dependencies`），没有数据库或外部 API 的集成示例。
- CI/测试：`package.json` 中 `test` 是占位文本（"No tests specified yet"）。目前没有测试框架配置（例如 Jest）。代理在添加测试或 CI 文件时应同时添加必要的 devDependencies 与配置文件。

## 给 AI 编码代理的具体指令（行为准则）

1. 修改或添加路由时，优先在 `src/` 下新增控制器文件并在 `AppModule`（或新模块）中注册。示例：新增 `GET /metrics`，请在 `app.controller.ts` 中新增方法并将实现委托给 `AppService` 或新服务。
2. 在实现业务逻辑时使用依赖注入，不要 new 服务实例或耦合全局状态。
3. 在变更 package 脚本或添加构建步骤时，保持 `pnpm build` 仍使用 `nest build`，并保证 `dist/` 输出与 `main.ts` 的路径一致。
4. **添加依赖时使用 `pnpm add` 或 `pnpm add -D`**（不要使用 npm），并提交生成的 `pnpm-lock.yaml`。
5. 不要假设存在未版本控制的配置文件（例如 `.env`、`.eslintrc`、`.prettierrc`、Jest 配置）；如需新增，先在 PR 描述中说明并添加样例配置。
6. 所有对外暴露的 JSON 接口应保持 JSON 序列化兼容（例如 `Date` 使用 ISO 字符串）。`/health` 的实现就是一个合规示例。
7. **包管理器**: 项目现已全面使用 **pnpm**（v8.0.0+），详见 `MIGRATION_TO_PNPM.md` 和 `package.json` 的 engines 字段。

## 可用的修改示例（直接可复制参考）

- 添加一个新路由（概要）：
    - 在 `src/app.controller.ts` 中加入：

        ```ts
        @Get('metrics')
        getMetrics() {
          return this.appService.getMetrics();
        }
        ```

    - 在 `src/app.service.ts` 中添加 `getMetrics()` 方法并导出简单对象。

## 合并/更新策略

- 如果仓库已有 `.github/copilot-instructions.md`，保留其中与本仓库直接相关的内容（例如特殊脚本或 CI 步骤），并补充/覆盖本文件中明确的命令、文件路径和示例。
- 本文件只记录可从代码库直接观察到的约定与流程，不包含尚未配置的工具或测试框架的建议（除非用户要求添加）。

## 还需要你确认的点

- 是否希望我把 ESLint/Prettier/Jest 等开发工具的配置一并加入仓库？
- 是否有约定的 PR/branch 流程或代码风格（例如使用特定的 commit message 规范）？

请告诉我你要我先做哪个（例如：添加 ESLint 配置并修复现有代码，或保留当前最小示例并只生成文档）。
