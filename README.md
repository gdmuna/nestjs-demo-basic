# nest-demo-basic

一个极简的 NestJS 后端服务示例框架。

## 功能

- 基本的 NestJS 应用结构
- 健康检查接口
- TypeScript 支持
- 开发与生产模式

## 前提

- Node.js（v20 或更高）
- pnpm（v8.0.0 或更高）

## 安装

```bash
pnpm install
```

## 配置

应用可以通过环境变量进行配置。将 `.env.example` 复制为 `.env` 以自定义设置：

```bash
cp .env.example .env
```

可用的环境变量：

- `PORT` - 服务器端口（默认：3000）

## 运行应用

```bash
# 开发模式（自动重载）
pnpm start:dev

# 生产模式
pnpm build
pnpm start:prod

# 使用自定义端口（默认 3000）
set PORT=4000 && pnpm start:prod
```

## API 接口

- `GET /` - 返回 `Hello World!`
- `GET /health` - 健康检查接口，返回状态与时间戳

## 项目结构

```
src/
├── main.ts           # 应用入口
├── app.module.ts     # 根模块
├── app.controller.ts # 主控制器
└── app.service.ts    # 主服务
```

## 构建

```bash
pnpm build
```

构建产物将输出到 `dist/` 目录。

## 许可证

MIT
