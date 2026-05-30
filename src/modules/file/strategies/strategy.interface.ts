import type { FastifyRequest } from 'fastify';
import type {
    AnyMultipartHandler,
    MultipartUploadHandlerOptions,
    MultipartBuffer,
    MultipartFileBuffer,
    SavedMultipartFileExtend,
    SavedMultipartFilesResultExtend,
    MultipartRequestHandlerInitType,
} from '@/common/utils/index.js';

import { FileDomain, FileVisibility, BucketType } from '@root/prisma/generated/enums.js';

/**
 * 文件域配置的基准结构。
 *
 * 以 `FileDomain` 枚举值作为键（均可选，每个 Strategy 只声明自己负责的 domain），
 * 使用 `satisfies DomainConfig` 既约束键必须为 FileDomain，又保留对象字面量的精确推断类型。
 */
export type DomainConfig = {
    [K in FileDomain]?: {
        files: {
            readonly allowedMime: readonly string[];
            readonly maxSize: number;
        };
        readonly bucketType: BucketType;
        readonly bucketKeyPrefix: string;
        readonly visibility: FileVisibility;
        /** 可选：字段校验 Schema（如 Zod object），用于 multipart 请求的字段结构验证 */
        readonly fields?: unknown;
    };
};

/**
 * 文件上传策略接口。
 * 每个实现类负责一组相关业务领域（domain）的上传规则。
 *
 * 该接口设计为 Strategy 模式中的抽象角色：
 * - 通过 `@RegisterStrategy()` 装饰器注册到 `StrategyRegistry`
 * - 业务层通过 `StrategyRegistry.resolve(domain)` 获取对应实例，不直接依赖具体策略类
 */
export interface IFileStrategy {
    /** 当前实例处理的 domain */
    readonly domain: FileDomain;

    readonly bucketType: BucketType;

    readonly bucketKeyPrefix: string;

    readonly visibility: FileVisibility;

    /** 该策略处理的 domain 列表 */
    listDomains(): string[];

    /** 生成对象存储 key */
    resolveKey(identifier: string): string;

    /**
     * 校验上传文件（类型、大小等）。
     * 不通过则抛出 FileInvalidTypeException。
     */
    validate(
        dto: { contentType: string; size?: number },
        options?: { throwOnInvalid?: boolean }
    ): void;

    /**
     * 创建服务端 multipart 上传处理器（服务端直传场景）。
     * Strategy 通过组合持有处理器的创建逻辑；不实现此方法说明该 Strategy 不支持服务端 multipart 直传。
     */
    createUploadHandler(
        req: FastifyRequest,
        options: MultipartUploadHandlerOptions
    ): Promise<AnyMultipartHandler>;

    getHandler(): AnyMultipartHandler | undefined;

    getHandlerType(): MultipartRequestHandlerInitType | undefined;

    getData(): MultipartBuffer[] | SavedMultipartFilesResultExtend | undefined;

    getFiles(): SavedMultipartFileExtend[] | MultipartFileBuffer[] | undefined;
}

/** Strategy 注册表接口 */
export interface IStrategyRegistry {
    /** 根据 domain 解析对应的 Strategy，未注册则抛出 FileInvalidDomainException */
    resolve(domain: string): IFileStrategy;

    /** 列出所有已注册的 Strategy 实例（去重） */
    listAll(): IFileStrategy[];
}
