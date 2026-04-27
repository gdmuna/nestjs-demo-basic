import { Injectable } from '@nestjs/common';
import { FileInvalidTypeException } from '../file.exception.js';
import type { UploadStrategy } from '../file.interface.js';

const ALLOWED_MIME = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];

@Injectable()
export class VideoStrategy implements UploadStrategy {
    validate(dto: { contentType: string }): void {
        if (!ALLOWED_MIME.includes(dto.contentType)) {
            throw new FileInvalidTypeException({
                message: `视频文件不支持 ${dto.contentType} 类型，支持：${ALLOWED_MIME.join(', ')}`,
            });
        }
    }

    resolveKey(userId: string, filename: string): string {
        const ext = filename.split('.').pop() ?? 'bin';
        return `videos/${userId}/${Date.now()}.${ext}`;
    }

    getBucket(): string {
        return 'private';
    }
}
