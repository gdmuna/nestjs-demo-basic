import { Injectable } from '@nestjs/common';
import { FileInvalidTypeException } from '../file.exception.js';
import type { UploadStrategy } from '../file.interface.js';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Injectable()
export class AvatarStrategy implements UploadStrategy {
    validate(dto: { contentType: string }): void {
        if (!ALLOWED_MIME.includes(dto.contentType)) {
            throw new FileInvalidTypeException({
                message: `头像文件不支持 ${dto.contentType} 类型，支持：${ALLOWED_MIME.join(', ')}`,
            });
        }
    }

    resolveKey(userId: string, filename: string): string {
        const ext = filename.split('.').pop() ?? 'bin';
        return `avatars/${userId}/${Date.now()}.${ext}`;
    }

    getBucket(): string {
        return 'public';
    }
}
