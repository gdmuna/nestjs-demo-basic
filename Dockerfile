# ===== 构建阶段 =====
FROM node:22-slim AS builder

# 安装依赖和 OpenSSL (Prisma 需要)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装生产依赖 (--prod flag, 跳过 prepare 脚本避免 husky 错误)
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# 复制源代码
COPY src ./src
COPY tsconfig.json tsconfig.build.json nest-cli.json prisma.config.ts ./
COPY prisma ./prisma

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# 生成 Prisma Client
RUN pnpm prisma generate

# 构建项目
RUN pnpm build

# ===== 运行阶段 =====
FROM node:22-slim

# 安装依赖和 OpenSSL (运行时 Prisma Client 可能需要)
RUN apt-get update -y && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/* && npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 从构建阶段复制依赖
COPY --from=builder /app/node_modules ./node_modules

# 从构建阶段复制构建输出
COPY --from=builder /app/dist ./dist

# 从构建阶段复制 Prisma 生成的代码
# COPY --from=builder /app/src/prisma/generated ./dist/src/prisma/generated

# 复制 prisma 配置文件 (运行时可能需要)
# COPY prisma ./prisma

# 复制 package.json (用于识别项目信息)
COPY package.json prisma.config.ts ./

# 暴露端口 (默认 3000，根据需要修改)
EXPOSE 3000

# 环境变量
ARG GIT_COMMIT DATABASE_URL APP_VERSION
ENV GIT_COMMIT=$GIT_COMMIT
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=$DATABASE_URL
ENV npm_package_version=$APP_VERSION

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl --fail http://localhost:${PORT:-3000}/health
# 启动应用
CMD ["node", "dist/src/main.js"]
