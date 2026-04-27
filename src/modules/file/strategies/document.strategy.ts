import { Injectable } from '@nestjs/common';
import { FileInvalidTypeException } from '../file.exception.js';
import type { UploadStrategy } from '../file.interface.js';

const ALLOWED_MIME = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
];

@Injectable()
export class DocumentStrategy implements UploadStrategy {
    validate(dto: { contentType: string }): void {
        if (!ALLOWED_MIME.includes(dto.contentType)) {
            throw new FileInvalidTypeException({
                message: `文档文件不支持 ${dto.contentType} 类型，支持：${ALLOWED_MIME.join(', ')}`,
            });
        }
    }

    resolveKey(userId: string, filename: string): string {
        const ext = filename.split('.').pop() ?? 'bin';
        return `documents/${userId}/${Date.now()}.${ext}`;
    }

    getBucket(): string {
        return 'private';
    }
}
