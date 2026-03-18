import { Module } from '@nestjs/common';
import { ErrorDocumentationController } from '@/modules/error-catalog/error-catalog.controller.js';
import { ErrorDocumentationService } from '@/modules/error-catalog/error-catalog.service.js';

@Module({
    controllers: [ErrorDocumentationController],
    providers: [ErrorDocumentationService],
    exports: [ErrorDocumentationService],
})
export class ErrorDocumentationModule {}
