import { FileInvalidTypeException } from '../file.exception.js';

import type { UploadStrategy } from '../file.interface.js';

import { Logger } from '@/common/services/logger.service.js';

import { FileDomain } from '@root/prisma/generated/enums.js';

import { Injectable } from '@nestjs/common';

import type { FastifyRequest } from 'fastify';
import {
    MultipartFile,
    MultipartValue,
    SavedMultipartFile,
    SavedMultipartFilesResult,
    FastifyMultipartBaseOptions,
} from '@fastify/multipart';

import { z } from 'zod';
import { v7 as uuidv7 } from 'uuid';

const ALLOWED_MIME = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];

// const PART_SIZE = 50 * 1024 * 1024; // 50MB

// @Injectable()
// export class VideoStrategy implements UploadStrategy {
//     validate(dto: { contentType: string }): void {
//         if (!ALLOWED_MIME.includes(dto.contentType)) {
//             throw new FileInvalidTypeException({
//                 message: `视频文件不支持 ${dto.contentType} 类型，支持：${ALLOWED_MIME.join(', ')}`,
//             });
//         }
//     }

//     resolveKey(): string {
//         return `videos/${uuidv7()}`;
//     }

//     getBucket(): string {
//         return 'public';
//     }

//     // getPartCount(fileSize: number): number {
//     //     return Math.ceil(fileSize / PART_SIZE);
//     // }
// }

export type MultipartRequestHandlerResolveType = 'stream' | 'buffer' | 'file';

export type MultipartRequestHandlerInitType = Exclude<MultipartRequestHandlerResolveType, 'stream'>;

export type MultipartRequestHandlerResolveOptions = {
    resolveType: MultipartRequestHandlerResolveType;
} & FastifyMultipartBaseOptions;

export type MultipartRequestHandlerInitOptions = {
    resolveType: MultipartRequestHandlerInitType;
} & FastifyMultipartBaseOptions;

@Injectable()
export class VideoStrategy {
    readonly logger = new Logger(VideoStrategy.name);

    private strategy = {
        userVideo: {
            files: {
                file: {
                    ALLOWED_MIME: [
                        'video/mp4',
                        'video/webm',
                        'video/ogg',
                        'video/quicktime',
                        'video/x-msvideo',
                    ],
                    MAX_SIZE: 500 * 1024 * 1024, // 500MB
                },
                DEFAULT: {
                    ALLOWED_MIME: [
                        'video/mp4',
                        'video/webm',
                        'video/ogg',
                        'video/quicktime',
                        'video/x-msvideo',
                    ],
                    MAX_SIZE: 500 * 1024 * 1024, // 500MB
                },
            },
            fields: z.object({
                domain: z
                    .string()
                    .refine((val) => val === FileDomain.VIDEO)
                    .meta({ title: '文件领域', example: 'AVATAR' }),
                filename: z.string().meta({ title: '原始文件名', example: 'movie.mp4' }),
            }),
        },
    };

    resolveBucket(visibility?: string): string {
        return 'public';
    }

    resolveKey(fileid: string) {
        return `videos/${fileid}`;
    }

    getDomain() {
        return FileDomain.VIDEO;
    }

    getVisibility(): string {
        return 'public';
    }

    createHandler<P>(
        req: FastifyRequest,
        options: MultipartRequestHandlerResolveOptions & {
            /**
             * 'stream' resolveType 需要逐个处理 multipart 流中的每个 part
             * 这适用于需要边上传边处理的场景，如大文件上传或实时处理
             * 使用时应注意流的正确关闭和错误处理，以避免资源泄漏
             */
            resolveType: 'stream';
        },
        processor: Parameters<typeof MultipartRequestHandler.processStream<P>>[2]
    ): Promise<{ results: P[]; fields: MultipartValue[] }>;

    createHandler(
        req: FastifyRequest,
        options: MultipartRequestHandlerResolveOptions & {
            /**
             * 'buffer' resolveType 需要将上传的文件内容读取到内存中
             * 这可能会导致内存占用过高，尤其是对于大文件
             * 因此，在实际使用中应谨慎使用，并考虑文件大小限制和错误处理
             */
            resolveType: 'buffer';
        }
    ): Promise<MultipartRequestHandler<{ type: 'buffer'; data: MultipartBuffer[] }>>;

    createHandler(
        req: FastifyRequest,
        options: MultipartRequestHandlerResolveOptions & {
            /**
             * 'file' resolveType 适用于需要将上传的文件保存到服务器磁盘上的场景，特别是当文件较大时，可以避免内存占用过高。
             * 使用时需要确保服务器有足够的磁盘空间，并且正确处理文件的清理和安全性问题，以防止潜在的安全风险。
             */
            resolveType: 'file';
            tmpdir?: string; // 可选的临时目录参数，默认为 './data/temp/uploads'
        }
    ): Promise<MultipartRequestHandler<{ type: 'file'; data: SavedMultipartFilesResult }>>;

    createHandler<P>(
        req: FastifyRequest,
        options: MultipartRequestHandlerResolveOptions & {
            resolveType: MultipartRequestHandlerResolveType;
        },
        processor?: Parameters<typeof MultipartRequestHandler.processStream<P>>[2] // 仅当 resolveType 是 'stream' 时需要提供 processor 参数
    ): Promise<{ results: P[]; fields: MultipartValue[] } | MultipartRequestHandler> {
        if (options.resolveType === 'stream' && processor) {
            return MultipartRequestHandler.processStream(req, options, processor);
        }
        options = {
            throwFileSizeLimit: true,
            limits: {
                fileSize: 500 * 1024 * 1024, // 500MB
            },
            ...options,
        };
        return MultipartRequestHandler.init(req, options as any, this);
    }
}

export type MultipartBuffer =
    | (Omit<MultipartFile, 'toBuffer'> & { buffer: Buffer })
    | MultipartValue;

type HandlerState =
    | { type: 'buffer'; data: MultipartBuffer[] }
    | { type: 'file'; data: SavedMultipartFilesResult };

export class MultipartRequestHandler<T extends HandlerState = HandlerState> {
    private readonly logger: Logger;

    private validateState: 'idle' | 'success' | 'error' = 'idle';

    private metadata: Record<string, any> = {};

    private constructor(
        private readonly state: T,
        private readonly strategy: VideoStrategy
    ) {
        this.logger = strategy.logger;

        const domain = strategy.getDomain();
        const visibility = strategy.getVisibility();
        const bucket = strategy.resolveBucket(visibility);

        this.metadata = {
            domain,
            visibility,
            bucket,
        };
    }

    get type(): T['type'] {
        return this.state.type;
    }

    getData(): T['data'] {
        return this.state.data;
    }

    getStrategy() {
        return this.strategy;
    }

    getFiles(
        this: BufferMultipartHandler
    ): (Omit<MultipartFile, 'toBuffer'> & { buffer: Buffer })[];
    getFiles(this: FileMultipartHandler): SavedMultipartFile[];
    getFiles() {
        if (this.state.type === 'buffer') {
            return this.state.data.filter((item) => item.type === 'file');
        }
        return this.state.data.files;
    }

    getValidateState() {
        return this.validateState;
    }

    getMetadata() {
        return this.metadata;
    }

    validate() {}

    /** 内部工厂：让 TypeScript 从 state 参数推断出具体的 S */
    private static create<T extends HandlerState>(state: T, strategy: VideoStrategy) {
        return new MultipartRequestHandler(state, strategy);
    }

    static async init(
        req: FastifyRequest,
        options: MultipartRequestHandlerInitOptions & { resolveType: 'buffer' },
        strategy: VideoStrategy
    ): Promise<MultipartRequestHandler<{ type: 'buffer'; data: MultipartBuffer[] }>>;

    static async init(
        req: FastifyRequest,
        options: MultipartRequestHandlerInitOptions & { resolveType: 'file' },
        strategy: VideoStrategy
    ): Promise<MultipartRequestHandler<{ type: 'file'; data: SavedMultipartFilesResult }>>;

    static async init(
        req: FastifyRequest,
        options: MultipartRequestHandlerInitOptions & {
            resolveType: Exclude<MultipartRequestHandlerResolveType, 'stream'>;
        },
        strategy: VideoStrategy
    ) {
        const { resolveType, ...multipartOptions } = options;

        if (resolveType === 'buffer') {
            /**
             * 'buffer' resolveType 需要将上传的文件内容读取到内存中
             * 这可能会导致内存占用过高，尤其是对于大文件
             * 因此，在实际使用中应谨慎使用，并考虑文件大小限制和错误处理
             */
            const parts = req.parts(multipartOptions);
            const data: MultipartBuffer[] = [];
            for await (const part of parts) {
                if (part.type === 'file') {
                    const buffer = await part.toBuffer();
                    data.push({ ...part, buffer });
                } else data.push(part);
            }
            return MultipartRequestHandler.create({ type: 'buffer', data }, strategy);
        } else if (resolveType === 'file') {
            /**
             * 'file' resolveType 适用于需要将上传的文件保存到服务器磁盘上的场景，特别是当文件较大时，可以避免内存占用过高。
             * 使用时需要确保服务器有足够的磁盘空间，并且正确处理文件的清理和安全性问题，以防止潜在的安全风险。
             */
            const data = await req.saveRequestFiles({
                tmpdir: './data/temp/uploads',
                ...multipartOptions,
            });
            return MultipartRequestHandler.create({ type: 'file', data }, strategy);
        }

        // 如果接受了未知的 resolveType，抛出错误
        throw new Error('Unsupported resolveType');
    }

    /**
     * 流式直传模式 —— 适用于 S3 流式直传等需要边读边传的场景。
     *
     * 每个 file part 的 `Readable` stream 在 `processor` 回调内立即消费：
     * - 不缓冲到内存，天然支持大文件
     * - 不产生 busboy 背压死锁
     * - 非文件字段（fields）自动收集到 `fields` 返回值中
     *
     * @example S3 直传（@aws-sdk/lib-storage）
     * ```ts
     * const { results, fields } = await MultipartRequestHandler.processStream(
     *   req,
     *   { limits: { fileSize: 500 * 1024 * 1024 } },
     *   async (part) => {
     *     const upload = new Upload({
     *       client: s3Client,
     *       params: {
     *         Bucket: 'my-bucket',
     *         Key: `uploads/${part.filename}`,
     *         Body: part.file,          // ← Readable stream 直接传入，无内存缓冲
     *         ContentType: part.mimetype,
     *       },
     *     });
     *     return upload.done();         // Upload 内部处理背压，await 完成后流已消费
     *   }
     * );
     * ```
     */
    static async processStream<T>(
        req: FastifyRequest,
        options: FastifyMultipartBaseOptions,
        processor: (part: MultipartFile | MultipartValue) => Promise<T>
    ): Promise<{ results: T[]; fields: MultipartValue[] }> {
        const parts = req.parts(options);
        const results: T[] = [];
        const fields: MultipartValue[] = [];
        for await (const part of parts) {
            if (part.type === 'file') {
                results.push(await processor(part));
                // 安全兜底：若 processor 未消费文件流，强制排空以解除 busboy 背压死锁
                // （例如 processor 只读取元数据而不读取流内容时触发）
                if (!part.file.readableEnded) {
                    part.file.resume();
                }
            } else {
                results.push(await processor(part)); // 让外部 processor 有机会处理非文件字段（例如验证或转换），即使它们不关心返回值
                fields.push(part);
            }
        }
        return { results, fields };
    }
}

/** 已将文件内容读入内存缓冲区的 multipart 处理器（buffer 模式） */
export type BufferMultipartHandler = MultipartRequestHandler<{
    type: 'buffer';
    data: MultipartBuffer[];
}>;
/** 已将文件保存到磁盘临时目录的 multipart 处理器（file 模式） */
export type FileMultipartHandler = MultipartRequestHandler<{
    type: 'file';
    data: SavedMultipartFilesResult;
}>;
