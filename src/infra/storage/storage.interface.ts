export type StorageModuleOptions = {
    storageProvider?: 's3';
    options: S3ProviderOptions;
    imports?: any[];
};

export interface S3ProviderOptions {
    endpoint: string;
    region?: string;
    accessKeyId: string;
    secretAccessKey: string;
    forcePathStyle?: boolean;
    bucketPublic: string;
    bucketPrivate: string;
    /** 公开桶的访问基础 URL（如 CDN 地址），用于拼接公开文件的访问链接 */
    publicBaseUrl?: string;
}

export interface StorageModuleAsyncOptions {
    useFactory?: (...args: any[]) => Promise<StorageModuleOptions> | StorageModuleOptions;
    useClass?: any;
    useExisting?: any;
    imports?: any[];
    inject?: any[];
}
