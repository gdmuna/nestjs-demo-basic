import { S3_OPTIONS } from './storage.constant.js';
import { StorageModuleOptions, StorageModuleAsyncOptions } from './storage.interface.js';
import { StorageService } from './storage.service.js';

import { Module, DynamicModule, Provider } from '@nestjs/common';

import { S3Client } from '@aws-sdk/client-s3';

@Module({
    providers: [StorageService],
    exports: [StorageService],
})
export class StorageModule {
    static forRoot(options: StorageModuleOptions): DynamicModule {
        return {
            module: StorageModule,
            imports: options.imports || [],
            providers: [
                StorageService,
                { provide: S3_OPTIONS, useValue: options },
                this.createS3ClientProvider(),
            ],
            exports: [StorageService, S3Client, S3_OPTIONS],
        };
    }

    static forRootAsync(options: StorageModuleAsyncOptions): DynamicModule {
        return {
            module: StorageModule,
            imports: options.imports || [],
            providers: [
                StorageService,
                ...this.createAsyncProvider(options),
                this.createS3ClientProvider(),
            ],
            exports: [StorageService, S3Client, S3_OPTIONS],
        };
    }

    private static createS3ClientProvider(): Provider {
        return {
            provide: S3Client,
            useFactory: (opts: StorageModuleOptions) => {
                if (!opts.options) return;
                return new S3Client({
                    endpoint: opts.options.endpoint,
                    region: opts.options.region || 'cn-east-1',
                    forcePathStyle: opts.options.forcePathStyle || true,
                    credentials: {
                        accessKeyId: opts.options.accessKeyId,
                        secretAccessKey: opts.options.secretAccessKey,
                    },
                });
            },
            inject: [S3_OPTIONS],
        };
    }

    private static createAsyncProvider(options: StorageModuleAsyncOptions): Provider[] {
        const provider: Provider[] = [];
        if (options.useFactory) {
            provider.push({
                provide: S3_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            });
        } else if (options.useClass) {
            provider.push({
                provide: S3_OPTIONS,
                useFactory: async (optionsFactory: any) => optionsFactory.createS3Options(),
                inject: [options.useClass],
            });
        } else if (options.useExisting) {
            provider.push({
                provide: S3_OPTIONS,
                useFactory: async (optionsFactory: any) => optionsFactory.createS3Options(),
                inject: [options.useExisting],
            });
        }
        return provider;
    }
}
