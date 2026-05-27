# ===== 构建阶段 =====
FROM node:22.22-slim AS builder

# 设置工作目录
WORKDIR /app

# 替换为国内镜像源（阿里云），避免官方源在国内网络不稳定
COPY config/apt/debian.sources /etc/apt/sources.list.d/debian.sources

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && npm install -g pnpm

# 复制 package.json 和 pnpm 配置文件
COPY package.json .npmrc ./

# 若仓库中存在 pnpm-lock.yaml，且你想保证依赖版本一致、构建可复现，请取消下一行的注释
# COPY pnpm-lock.yaml ./

# ========== 安装所有依赖 (构建阶段需要 devDependencies 中的 TypeScript 和类型定义) ==========

# 若仓库中存在 pnpm-lock.yaml，且你想保证依赖版本一致、构建可复现，请取消下一行的注释
# RUN pnpm install --frozen-lockfile --ignore-scripts

# 若仓库中存在 pnpm-lock.yaml，且你想保证依赖版本一致、构建可复现，请注释掉下一行
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# ========== 安装所有依赖 (构建阶段需要 devDependencies 中的 TypeScript 和类型定义) ==========

# 复制源代码和配置文件
COPY src ./src
COPY tsconfig.json tsconfig.build.json nest-cli.json prisma.config.ts ./
COPY prisma ./prisma
COPY config ./config

# 数据库URL占位符，你不应在构建镜像时使用真实的数据库URL
# 但需要一个占位符以便生成Prisma Client，且该占位符所使用的数据库类型应与实际运行时相同
ARG DATABASE_URL="postgresql://username:password@host:port/dbName?schema=public"
ARG SHADOW_DATABASE_URL="postgresql://username:password@host:port/dbName?schema=public"

RUN pnpm prisma generate \
&& pnpm build \
&& pnpm prune --prod --ignore-scripts

# ===== 运行阶段 =====
FROM node:22.22-slim AS runner

# 设置工作目录（提前设置，方便后续 chown）
WORKDIR /app

# 从构建阶段复制依赖
COPY --from=builder /app/node_modules ./node_modules

# 从构建阶段复制构建输出
COPY --from=builder /app/dist ./dist

COPY secrets/env/* ./secrets/env/

COPY secrets/keys/* ./secrets/keys/

# 替换为国内镜像源（阿里云），避免官方源在国内网络不稳定
COPY config/apt/debian.sources /etc/apt/sources.list.d/debian.sources

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# 安装依赖和 OpenSSL (运行时 Prisma Client 可能需要)
RUN apt-get update \
    && apt-get install -y openssl curl \
    && curl -sfS https://dotenvx.sh/install.sh | sh \
    && chown -R node:node /app \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

# 环境变量
ENV APP_VERSION='' \
    APP_NAME='' \
    GIT_COMMIT='' \
    NODE_ENV=production

EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
    CMD curl --fail http://localhost:3000/api/v1/health

# 启动应用
CMD ["sh", "-c", "exec dotenvx run -f secrets/env/.env.${NODE_ENV} -- node dist/src/main.js"]
