import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const logger = new Logger('AppModule');
    const port = parseInt(process.env.PORT ?? '3000', 10);
    await app.listen(port).catch((err) => {
        if (err.code === 'EADDRINUSE') {
            logger.error(
                `❌ 启动失败：端口 ${port} 已被占用。`,
                `
\x1b[33m请尝试以下方案：
1. 使用其他端口：更改环境变量 PORT 的值
2. 查找占用端口的进程：
    - （Windows）：netstat -ano | findstr :${port}
    - （Linux/Mac）：lsof -i :${port}
3. 杀死占用端口的进程：
    - （Windows）：taskkill /PID <PID> /F （例：taskkill /PID 36396 /F）
    - （Linux/Mac）：kill -9 <PID> （例：kill -9 36396）\x1b[0m
`
            );
        } else {
            logger.error('❌ 启动失败：未知错误:', err);
        }
        process.exit(1);
    });
    logger.log(`✅ 应用已启动: http://localhost:${port}`);
    logger.log(`🚀 数据库URL: ${process.env.DATABASE_URL || 'unknow'}`);
}

bootstrap();
