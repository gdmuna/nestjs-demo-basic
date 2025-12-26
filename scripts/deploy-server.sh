#!/bin/bash
# 远程服务器部署脚本
# 使用方法: bash deploy-server.sh <docker-image> <container-name> <port> [db-url] [network]
# 示例: bash deploy-server.sh myapp:latest myapp 3001 "postgresql://user:pass@postgresql:5432/dbname" 1panel-network

set -e

# 参数解析
DOCKER_IMAGE=$1
CONTAINER_NAME=${2:-nestjs-app}
PORT=${3:-3001}
DB_URL=${4}
NETWORK=${5}

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 参数校验
if [ -z "$DOCKER_IMAGE" ]; then
    echo -e "${RED}❌ 错误: 缺少 Docker 镜像参数${NC}"
    echo "使用方法: bash deploy-server.sh <docker-image> <container-name> <port> [db-url]"
    exit 1
fi

if [ -z "$DB_URL" ]; then
    echo -e "${YELLOW}⚠️  警告: 未提供数据库URL，容器可能无法连接数据库${NC}"
    echo -e "${YELLOW}   建议使用: bash deploy-server.sh $DOCKER_IMAGE $CONTAINER_NAME $PORT \"postgresql://...\"${NC}"
    read -p "继续部署？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${BLUE}================================${NC}"
echo -e "${YELLOW}📦 开始部署: $DOCKER_IMAGE${NC}"
echo -e "${BLUE}================================${NC}"

# 停止并删除旧容器
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}⏹️  停止旧容器...${NC}"
    docker stop $CONTAINER_NAME || true
    docker rm $CONTAINER_NAME || true
fi

# 拉取最新镜像
echo -e "${YELLOW}⬇️  拉取Docker镜像...${NC}"
docker pull $DOCKER_IMAGE

# 记录旧镜像以便清理
OLD_IMAGE_ID=$(docker images --format "{{.ID}}" $DOCKER_IMAGE 2>/dev/null | head -n 1)

# 构建 docker run 命令
DOCKER_RUN_CMD="docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p $PORT:3000 \
    -e NODE_ENV=production"

# 如果提供了网络参数，加入指定网络
if [ -n "$NETWORK" ]; then
    DOCKER_RUN_CMD="$DOCKER_RUN_CMD \
    --network $NETWORK"
    echo -e "${BLUE}🌐 使用网络: $NETWORK${NC}"
fi

# 如果提供了数据库URL，添加环境变量
if [ -n "$DB_URL" ]; then
    DOCKER_RUN_CMD="$DOCKER_RUN_CMD \
    -e DB_URL=\"$DB_URL\""
fi

# 添加日志配置和镜像
DOCKER_RUN_CMD="$DOCKER_RUN_CMD \
    --log-driver json-file \
    --log-opt max-size=10m \
    --log-opt max-file=3 \
    $DOCKER_IMAGE"

# 运行新容器
echo -e "${YELLOW}🚀 启动新容器...${NC}"
eval $DOCKER_RUN_CMD

# 等待健康检查通过
echo -e "${YELLOW}⏳ 等待健康检查通过...${NC}"
RETRY_COUNT=0
MAX_RETRIES=10
HEALTH_CHECK_INTERVAL=3

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    sleep $HEALTH_CHECK_INTERVAL

    # 检查容器是否还在运行
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo -e "${RED}❌ 容器已退出${NC}"
        echo -e "${RED}查看日志:${NC}"
        docker logs $CONTAINER_NAME
        exit 1
    fi

    # 检查健康状态
    HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null || echo "starting")

    if [ "$HEALTH_STATUS" = "healthy" ]; then
        echo -e "${GREEN}✅ 健康检查通过${NC}"
        break
    elif [ "$HEALTH_STATUS" = "unhealthy" ]; then
        echo -e "${RED}❌ 健康检查失败${NC}"
        docker logs --tail 50 $CONTAINER_NAME
        exit 1
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -e "${YELLOW}   尝试 $RETRY_COUNT/$MAX_RETRIES (状态: $HEALTH_STATUS)${NC}"
done

# 超时检查
if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${YELLOW}⚠️  健康检查超时，但容器仍在运行${NC}"
    echo -e "${YELLOW}   请手动验证: http://localhost:${PORT}/health${NC}"
fi

# 清理旧镜像
if [ -n "$OLD_IMAGE_ID" ]; then
    NEW_IMAGE_ID=$(docker images --format "{{.ID}}" $DOCKER_IMAGE 2>/dev/null | head -n 1)
    if [ "$OLD_IMAGE_ID" != "$NEW_IMAGE_ID" ]; then
        echo -e "${YELLOW}🧹 清理旧镜像: $OLD_IMAGE_ID${NC}"
        docker rmi $OLD_IMAGE_ID 2>/dev/null || true
    fi
fi

# 显示部署信息
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}✨ 部署完成！${NC}"
echo -e "${BLUE}================================${NC}"
echo "容器名称: $CONTAINER_NAME"
echo "镜像版本: $DOCKER_IMAGE"
echo "监听端口: $PORT"
echo "健康检查: http://localhost:${PORT}/health"
echo "查看日志: docker logs -f $CONTAINER_NAME"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "${BLUE}================================${NC}"
