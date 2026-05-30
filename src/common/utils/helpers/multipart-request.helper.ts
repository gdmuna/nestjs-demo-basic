import type { FastifyRequest } from 'fastify';
import type {
    MultipartFile,
    MultipartValue,
    SavedMultipartFile,
    SavedMultipartFilesResult,
    FastifyMultipartBaseOptions,
} from '@fastify/multipart';

import { FileDomain } from '@root/prisma/generated/enums.js';

import { v7 as uuidv7 } from 'uuid';

// ─── 数据类型 ─────────────────────────────────────────────────────────────────

export type MultipartFileBuffer = Omit<MultipartFile, 'toBuffer'> & { buffer: Buffer; id: string };

export type MultipartBuffer = MultipartFileBuffer | MultipartValue;

export type MultipartProcessStream<T> = { results: T[]; fields: MultipartValue[] };

export type MultipartStreamProcessor<T> = (part: MultipartFile | MultipartValue) => Promise<T>;

// ─── Handler 接口（判别联合）─────────────────────────────────────────────────

/** 文件内容已读入内存的 buffer 模式处理器 */
export interface BufferMultipartHandler {
    readonly type: 'buffer';
    getFiles(): MultipartFileBuffer[];
    getData(): MultipartBuffer[];
}

export interface SavedMultipartFileExtend extends SavedMultipartFile {
    id: string;
}

export interface SavedMultipartFilesResultExtend extends SavedMultipartFilesResult {
    files: SavedMultipartFileExtend[];
}

/** 文件已写入磁盘临时目录的 file 模式处理器 */
export interface FileMultipartHandler {
    readonly type: 'file';
    getFiles(): SavedMultipartFileExtend[];
    getData(): SavedMultipartFilesResultExtend;
}

export type AnyMultipartHandler = BufferMultipartHandler | FileMultipartHandler;

// ─── Handler 初始化选项 ────────────────────────────────────────────────────────

export type MultipartHandlerOptions = {
    resolveType: MultipartRequestHandlerInitType;
    tmpdir?: string;
} & FastifyMultipartBaseOptions;

// ─── Strategy 扩展 API 类型 ────────────────────────────────────────────────────

/** Strategy.createUploadHandler 支持的三种解析模式 */
// export type MultipartRequestHandlerResolveType = 'stream' | 'buffer' | 'file';

export type MultipartRequestHandlerInitType = 'buffer' | 'file';

// export type MultipartRequestHandlerResolveOptions = {
//     resolveType: MultipartRequestHandlerResolveType;
// } & FastifyMultipartBaseOptions;

export type MultipartRequestHandlerInitOptions = {
    resolveType: MultipartRequestHandlerInitType;
} & FastifyMultipartBaseOptions;

/** createUploadHandler 的参数类型 */
export type MultipartUploadHandlerOptions = {
    resolveType: 'buffer' | 'file';
    domain: FileDomain;
    tmpdir?: string;
} & FastifyMultipartBaseOptions;

// ─── HandlerBase（不持有 Strategy 引用）──────────────────────────────────────

// class HandlerBase implements MultipartBaseHandler {
//     protected validateState: 'idle' | 'success' | 'error' = 'idle';
//     protected readonly metadata?: MultipartHandlerMetadata;

//     constructor(metadata?: MultipartHandlerMetadata) {
//         this.metadata = metadata;
//     }

//     getMetadata(): MultipartHandlerMetadata | undefined {
//         return this.metadata;
//     }

//     getValidateState(): 'idle' | 'success' | 'error' {
//         return this.validateState;
//     }

//     validate(): void {}
// }

// ─── 具体实现 ─────────────────────────────────────────────────────────────────

class BufferHandlerImpl implements BufferMultipartHandler {
    readonly type = 'buffer';

    constructor(private readonly data: MultipartBuffer[]) {
        for (const item of data) {
            if (item.type === 'file' && !item.id) item.id = uuidv7();
        }
    }

    getData(): MultipartBuffer[] {
        return this.data;
    }

    getFiles(): MultipartFileBuffer[] {
        return this.data.filter((item) => item.type === 'file');
    }
}

class FileHandlerImpl implements FileMultipartHandler {
    readonly type = 'file';

    constructor(private readonly data: SavedMultipartFilesResultExtend) {
        for (const file of data.files) {
            if (!file.id) file.id = uuidv7();
        }
    }

    getData(): SavedMultipartFilesResultExtend {
        return this.data;
    }

    getFiles(): SavedMultipartFileExtend[] {
        return this.data.files;
    }
}

// ─── 工厂函数 ─────────────────────────────────────────────────────────────────

export function createMultipartHandler(
    req: FastifyRequest,
    options: MultipartHandlerOptions & { resolveType: 'buffer' }
): Promise<BufferMultipartHandler>;

export function createMultipartHandler(
    req: FastifyRequest,
    options: MultipartHandlerOptions & { resolveType: 'file' }
): Promise<FileMultipartHandler>;

export async function createMultipartHandler(
    req: FastifyRequest,
    options: MultipartHandlerOptions
): Promise<BufferMultipartHandler | FileMultipartHandler> {
    const { resolveType, tmpdir, ...multipartOptions } = options;

    if (resolveType === 'buffer') {
        const parts = req.parts(multipartOptions);
        const data: MultipartBuffer[] = [];
        for await (const part of parts) {
            if (part.type === 'file') {
                const buffer = await part.toBuffer();
                const id = uuidv7();
                data.push({ ...part, buffer, id });
            } else {
                data.push(part);
            }
        }
        return new BufferHandlerImpl(data);
    }

    const data: any = await req.saveRequestFiles({
        tmpdir: tmpdir ?? './data/temp/uploads',
        ...multipartOptions,
    });
    for (const file of data.files) {
        file.id = uuidv7();
    }
    return new FileHandlerImpl(data);
}

/**
 * 流式直传模式。
 *
 * 每个 file part 的 `Readable` 在 `processor` 回调内立即消费，不缓冲到内存，
 * 天然支持大文件并避免 busboy 背压死锁。
 *
 * @example S3 直传
 * ```ts
 * const { results } = await processMultipartStream(req, {}, async (part) => {
 *   if (part.type !== 'file') return null;
 *   return new Upload({ client, params: { Body: part.file, ... } }).done();
 * });
 * ```
 */
export async function processMultipartStream<T>(
    req: FastifyRequest,
    processor: MultipartStreamProcessor<T>,
    options?: FastifyMultipartBaseOptions
): Promise<MultipartProcessStream<T>> {
    const parts = req.parts(options);
    const results: T[] = [];
    const fields: MultipartValue[] = [];
    for await (const part of parts) {
        if (part.type === 'file') {
            results.push(await processor(part));
            // 安全兜底：若 processor 未消费流，强制排空以解除 busboy 背压死锁
            if (!part.file.readableEnded) {
                part.file.resume();
            }
        } else {
            results.push(await processor(part));
            fields.push(part);
        }
    }
    return { results, fields };
}
//     resolveType: MultipartRequestHandlerInitType;
// } & FastifyMultipartBaseOptions;

// export type MultipartBuffer =
//     | (Omit<MultipartFile, 'toBuffer'> & { buffer: Buffer })
//     | MultipartValue;

// export type MultipartProcessStream<T> = { results: T[]; fields: MultipartValue[] };

// export type MultipartStreamProcessor<T> = (part: MultipartFile | MultipartValue) => Promise<T>;

// // ─── Multipart 处理器接口（判别联合）─────────────────────────────────────────

// /** 已将文件内容读入内存缓冲区的 multipart 处理器（buffer 模式） */
// export interface BufferMultipartHandler {
//     readonly type: 'buffer';
//     getFiles(): (Omit<MultipartFile, 'toBuffer'> & { buffer: Buffer })[];
//     getData(): MultipartBuffer[];
//     getMetadata(): Record<string, any>;
//     getValidateState(): 'idle' | 'success' | 'error';
//     validate(): void;
// }

// /** 已将文件保存到磁盘临时目录的 multipart 处理器（file 模式） */
// export interface FileMultipartHandler {
//     readonly type: 'file';
//     getFiles(): SavedMultipartFile[];
//     getData(): SavedMultipartFilesResult;
//     getMetadata(): Record<string, any>;
//     getValidateState(): 'idle' | 'success' | 'error';
//     validate(): void;
// }

// class HandlerBase {
//     protected readonly logger: Logger;
//     protected validateState: 'idle' | 'success' | 'error' = 'idle';
//     protected metadata: Record<string, any>;

//     constructor(protected readonly strategy: VideoStrategy) {
//         this.logger = strategy.logger;
//         this.metadata = {
//             domain: strategy.getDomain(),
//             visibility: strategy.getVisibility(),
//         };
//     }

//     getStrategy() {
//         return this.strategy;
//     }

//     getMetadata(): Record<string, any> {
//         return this.metadata;
//     }

//     getValidateState(): 'idle' | 'success' | 'error' {
//         return this.validateState;
//     }

//     validate() {}
// }

// class BufferHandlerImpl extends HandlerBase implements BufferMultipartHandler {
//     readonly type = 'buffer';

//     constructor(
//         private readonly data: MultipartBuffer[],
//         strategy: VideoStrategy
//     ) {
//         super(strategy);
//     }

//     getData(): MultipartBuffer[] {
//         return this.data;
//     }

//     getFiles(): (Omit<MultipartFile, 'toBuffer'> & { buffer: Buffer })[] {
//         return this.data.filter(
//             (item): item is Omit<MultipartFile, 'toBuffer'> & { buffer: Buffer } =>
//                 item.type === 'file'
//         );
//     }
// }

// class FileHandlerImpl extends HandlerBase implements FileMultipartHandler {
//     readonly type = 'file';

//     constructor(
//         private readonly data: SavedMultipartFilesResult,
//         strategy: VideoStrategy
//     ) {
//         super(strategy);
//     }

//     getData(): SavedMultipartFilesResult {
//         return this.data;
//     }

//     getFiles(): SavedMultipartFile[] {
//         return this.data.files;
//     }
// }

// export function createMultipartHandler(
//     req: FastifyRequest,
//     options: MultipartRequestHandlerInitOptions & { resolveType: 'buffer' },
//     strategy: VideoStrategy
// ): Promise<BufferMultipartHandler>;

// export function createMultipartHandler(
//     req: FastifyRequest,
//     options: MultipartRequestHandlerInitOptions & { resolveType: 'file' },
//     strategy: VideoStrategy
// ): Promise<FileMultipartHandler>;

// export async function createMultipartHandler(
//     req: FastifyRequest,
//     options: MultipartRequestHandlerInitOptions,
//     strategy: VideoStrategy
// ): Promise<BufferMultipartHandler | FileMultipartHandler> {
//     const { resolveType, ...multipartOptions } = options;

//     if (resolveType === 'buffer') {
//         /**
//          * 'buffer' resolveType 需要将上传的文件内容读取到内存中
//          * 这可能会导致内存占用过高，尤其是对于大文件
//          * 因此，在实际使用中应谨慎使用，并考虑文件大小限制和错误处理
//          */
//         const parts = req.parts(multipartOptions);
//         const data: MultipartBuffer[] = [];
//         for await (const part of parts) {
//             if (part.type === 'file') {
//                 const buffer = await part.toBuffer();
//                 data.push({ ...part, buffer });
//             } else data.push(part);
//         }
//         return new BufferHandlerImpl(data, strategy);
//     }

//     /**
//      * 'file' resolveType 适用于需要将上传的文件保存到服务器磁盘上的场景，特别是当文件较大时，可以避免内存占用过高。
//      * 使用时需要确保服务器有足够的磁盘空间，并且正确处理文件的清理和安全性问题，以防止潜在的安全风险。
//      */
//     const data = await req.saveRequestFiles({
//         tmpdir: './data/temp/uploads',
//         ...multipartOptions,
//     });
//     return new FileHandlerImpl(data, strategy);
// }

// /**
//  * 流式直传模式 —— 适用于 S3 流式直传等需要边读边传的场景。
//  *
//  * 每个 file part 的 `Readable` stream 在 `processor` 回调内立即消费：
//  * - 不缓冲到内存，天然支持大文件
//  * - 不产生 busboy 背压死锁
//  * - 非文件字段（fields）自动收集到 `fields` 返回值中
//  *
//  * @example S3 直传（@aws-sdk/lib-storage）
//  * ```ts
//  * const { results, fields } = await processMultipartStream(
//  *   req,
//  *   { limits: { fileSize: 500 * 1024 * 1024 } },
//  *   async (part) => {
//  *     const upload = new Upload({
//  *       client: s3Client,
//  *       params: {
//  *         Bucket: 'my-bucket',
//  *         Key: `uploads/${part.filename}`,
//  *         Body: part.file,          // ← Readable stream 直接传入，无内存缓冲
//  *         ContentType: part.mimetype,
//  *       },
//  *     });
//  *     return upload.done();         // Upload 内部处理背压，await 完成后流已消费
//  *   }
//  * );
//  * ```
//  */
// export async function processMultipartStream<T>(
//     req: FastifyRequest,
//     options: FastifyMultipartBaseOptions,
//     processor: MultipartStreamProcessor<T>
// ): Promise<MultipartProcessStream<T>> {
//     const parts = req.parts(options);
//     const results: T[] = [];
//     const fields: MultipartValue[] = [];
//     for await (const part of parts) {
//         if (part.type === 'file') {
//             results.push(await processor(part));
//             // 安全兜底：若 processor 未消费文件流，强制排空以解除 busboy 背压死锁
//             // （例如 processor 只读取元数据而不读取流内容时触发）
//             if (!part.file.readableEnded) {
//                 part.file.resume();
//             }
//         } else {
//             results.push(await processor(part)); // 让外部 processor 有机会处理非文件字段（例如验证或转换），即使它们不关心返回值
//             fields.push(part);
//         }
//     }
//     return { results, fields };
// }
