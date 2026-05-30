import { FileController } from './file.controller.js';
import { FileService } from './file.service.js';
import { FileRepository } from './file.repository.js';
import { StrategyRegistry } from './strategies/index.js';
// 通过 strategies/index.js re-export 所有 Strategy 文件，模块加载时
// @RegisterStrategy() 装饰器自动将各类的构造函数写入全局注册表。
// 无需将 Strategy 类注册为 NestJS provider。
import './strategies/document.strategy.js';
import './strategies/image.strategy.js';
import './strategies/video.strategy.js';

import { Module } from '@nestjs/common';

@Module({
    controllers: [FileController],
    providers: [StrategyRegistry, FileService, FileRepository],
    exports: [FileService, FileRepository, StrategyRegistry],
})
export class FileModule {}
