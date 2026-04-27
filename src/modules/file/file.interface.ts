export type FileDomain = 'avatar' | 'document' | 'video';

export interface UploadStrategy {
    validate(dto: any): void; // 各领域自己的校验逻辑
    resolveKey(userId: string, filename: string): string; // 生成存储key的逻辑
    getBucket(): string; // 获取对应的bucket
}
