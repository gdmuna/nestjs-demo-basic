-- 在 PostgreSQL 启动时自动创建 Casdoor 所需的独立数据库
-- 该脚本由 docker-entrypoint-initdb.d 机制执行，仅首次初始化时运行
SELECT 'CREATE DATABASE casdoor OWNER nestjs'
  WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'casdoor'
  )\gexec
