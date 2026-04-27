import { FileController } from './file.controller.js';
import { FileService } from './file.service.js';
import { FileRepository } from './file.repository.js';
import { AvatarStrategy } from './strategies/avatar.strategy.js';
import { VideoStrategy } from './strategies/video.strategy.js';
import { DocumentStrategy } from './strategies/document.strategy.js';

import { Module } from '@nestjs/common';

@Module({
    controllers: [FileController],
    providers: [FileService, FileRepository, AvatarStrategy, VideoStrategy, DocumentStrategy],
    exports: [FileService],
})
export class FileModule {}
