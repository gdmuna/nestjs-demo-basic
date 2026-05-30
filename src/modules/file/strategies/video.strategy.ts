import { FileInvalidTypeException } from '../file.exception.js';
import { RegisterStrategy } from './strategy.decorator.js';
import type { IFileStrategy, DomainConfig } from './strategy.interface.js';
import type {
    AnyMultipartHandler,
    MultipartUploadHandlerOptions,
    MultipartRequestHandlerInitType,
} from '@/common/utils/index.js';
import { createMultipartHandler } from '@/common/utils/index.js';

import { Logger } from '@/common/services/logger.service.js';

import { FileDomain, FileVisibility, BucketType } from '@root/prisma/generated/enums.js';

import type { FastifyRequest } from 'fastify';
import type { FastifyMultipartBaseOptions } from '@fastify/multipart';

const VIDEO_MAX_SIZE = 500 * 1024 * 1024; // 500MB
const BUFFER_MAX_SIZE = 10 * 1024 * 1024; // 10MB

@RegisterStrategy()
export class VideoStrategy implements IFileStrategy {
    readonly logger = new Logger(VideoStrategy.name);

    static readonly acceptDomain: FileDomain[] = [
        'USER_COMMENT_VIDEO',
        'USER_POST_VIDEO',
        'USER_POST_ATTACHMENT',
        'USER_POST_VIDEO',
        'USER_TODO_ATTACHMENT',
        'USER_TODO_VIDEO',
    ];

    private handler?: AnyMultipartHandler;

    private handlerType?: MultipartRequestHandlerInitType;

    private domainConfig = {
        USER_COMMENT_VIDEO: {
            files: {
                allowedMime: [
                    'video/mp4',
                    'video/webm',
                    'video/ogg',
                    'video/quicktime',
                    'video/x-msvideo',
                ],
                maxSize: VIDEO_MAX_SIZE,
            },
            bucketType: 'PRIVATE',
            bucketKeyPrefix: 'videos/',
            visibility: 'PUBLIC',
        },
        USER_POST_VIDEO: {
            files: {
                allowedMime: [
                    'video/mp4',
                    'video/webm',
                    'video/ogg',
                    'video/quicktime',
                    'video/x-msvideo',
                ],
                maxSize: VIDEO_MAX_SIZE,
            },
            bucketType: 'PRIVATE',
            bucketKeyPrefix: 'videos/',
            visibility: 'PUBLIC',
        },
    } satisfies DomainConfig;

    readonly bucketType: BucketType;
    readonly bucketKeyPrefix: string;
    readonly visibility: FileVisibility;

    constructor(readonly domain: keyof typeof this.domainConfig) {
        this.bucketType = this.domainConfig[domain].bucketType ?? 'PRIVATE';
        this.bucketKeyPrefix = this.domainConfig[domain].bucketKeyPrefix ?? '';
        this.visibility = this.domainConfig[domain].visibility ?? 'PRIVATE';
    }

    listDomains(): string[] {
        return VideoStrategy.acceptDomain;
    }

    resolveKey(fileId: string): string {
        return this.bucketKeyPrefix + fileId;
    }

    validate(
        dto: { contentType?: string; size?: number },
        options?: { throwOnInvalid?: boolean }
    ): boolean {
        const domain = this.domain;
        const config = this.domainConfig[domain];
        const { contentType, size } = dto;
        const { throwOnInvalid = true } = options ?? {};
        if (contentType && !config.files.allowedMime.includes(contentType)) {
            throw new FileInvalidTypeException({
                message: `视频文件不支持 ${dto.contentType} 类型，支持：${config.files.allowedMime.join(', ')}`,
            });
        }

        if (size && size > config.files.maxSize) {
            throw new FileInvalidTypeException({
                message: `视频文件大小不能超过 ${config.files.maxSize} 字节`,
            });
        }
        return true;
    }

    /**
     * 根据 resolveType 实例化对应的 multipart Handler，并以组合方式持有。
     */
    async createUploadHandler(
        req: FastifyRequest,
        options: MultipartUploadHandlerOptions
    ): Promise<AnyMultipartHandler> {
        const { tmpdir, resolveType, ...restOpts } = options;

        if (resolveType === 'buffer') {
            const baseOpts: FastifyMultipartBaseOptions = {
                throwFileSizeLimit: true,
                limits: { fileSize: BUFFER_MAX_SIZE },
                ...restOpts,
            };
            this.handler = await createMultipartHandler(req, {
                ...baseOpts,
                resolveType: 'buffer',
            });
        } else {
            const baseOpts: FastifyMultipartBaseOptions = {
                throwFileSizeLimit: true,
                limits: { fileSize: VIDEO_MAX_SIZE },
                ...restOpts,
            };
            this.handler = await createMultipartHandler(req, {
                ...baseOpts,
                resolveType: 'file',
                tmpdir,
            });
        }
        return this.handler;
    }

    getHandler() {
        return this.handler;
    }

    getData() {
        return this.handler?.getData();
    }

    getFiles() {
        return this.handler?.getFiles();
    }

    getHandlerType() {
        return this.handlerType;
    }
}
