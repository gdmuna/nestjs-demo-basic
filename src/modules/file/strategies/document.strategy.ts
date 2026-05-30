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

const DOCUMENT_MAX_SIZE = 50 * 1024 * 1024; // 50MB
const BUFFER_MAX_SIZE = 5 * 1024 * 1024; // 5MB

@RegisterStrategy()
export class DocumentStrategy implements IFileStrategy {
    readonly logger = new Logger(DocumentStrategy.name);

    static readonly acceptDomain: FileDomain[] = [
        FileDomain.USER_POST_DOCUMENT,
        FileDomain.USER_TODO_DOCUMENT,
    ];

    private handler?: AnyMultipartHandler;

    private handlerType?: MultipartRequestHandlerInitType;

    private domainConfig = {
        [FileDomain.USER_POST_DOCUMENT]: {
            files: {
                allowedMime: [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/plain',
                    'text/csv',
                ],
                maxSize: DOCUMENT_MAX_SIZE,
            },
            bucketType: BucketType.PRIVATE,
            bucketKeyPrefix: 'documents/post/',
            visibility: FileVisibility.PRIVATE,
        },
        [FileDomain.USER_TODO_DOCUMENT]: {
            files: {
                allowedMime: [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/plain',
                    'text/csv',
                ],
                maxSize: DOCUMENT_MAX_SIZE,
            },
            bucketType: BucketType.PRIVATE,
            bucketKeyPrefix: 'documents/todo/',
            visibility: FileVisibility.PRIVATE,
        },
    } satisfies DomainConfig;

    readonly bucketType: BucketType;
    readonly bucketKeyPrefix: string;
    readonly visibility: FileVisibility;

    constructor(readonly domain: keyof typeof this.domainConfig) {
        this.bucketType = this.domainConfig[domain].bucketType;
        this.bucketKeyPrefix = this.domainConfig[domain].bucketKeyPrefix;
        this.visibility = this.domainConfig[domain].visibility;
    }

    listDomains(): string[] {
        return DocumentStrategy.acceptDomain;
    }

    resolveKey(fileId: string): string {
        return this.bucketKeyPrefix + fileId;
    }

    validate(
        dto: { contentType?: string; size?: number },
        options?: { throwOnInvalid?: boolean }
    ): boolean {
        const config = this.domainConfig[this.domain];
        const { contentType, size } = dto;
        const { throwOnInvalid = true } = options ?? {};
        if (contentType && !config.files.allowedMime.includes(contentType)) {
            throw new FileInvalidTypeException({
                message: `文档文件不支持 ${contentType} 类型，支持：${config.files.allowedMime.join(', ')}`,
            });
        }
        if (size && size > config.files.maxSize) {
            throw new FileInvalidTypeException({
                message: `文档文件大小不能超过 ${config.files.maxSize} 字节`,
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
                limits: { fileSize: DOCUMENT_MAX_SIZE },
                ...restOpts,
            };
            this.handler = await createMultipartHandler(req, {
                ...baseOpts,
                resolveType: 'file',
                tmpdir,
            });
        }
        this.handlerType = resolveType;
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
