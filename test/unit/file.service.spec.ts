import type { Mocked } from 'vitest';
import { FileService } from '@/modules/file/file.service.js';
import { FileRepository } from '@/modules/file/file.repository.js';
import { ImageStrategy } from '@/modules/file/strategies/image.strategy.js';
import { VideoStrategy } from '@/modules/file/strategies/video.strategy.js';
import { DocumentStrategy } from '@/modules/file/strategies/document.strategy.js';
import type { StrategyRegistry } from '@/modules/file/strategies/strategy-registry.js';
import {
    FileInvalidDomainException,
    FileInvalidTypeException,
    FileRecordNotFoundException,
    // FileStagingNotFoundException,
} from '@/modules/file/file.exception.js';
import type { StorageService } from '@/infra/storage/storage.service.js';
import { Readable } from 'stream';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockStorageService: Mocked<
    Pick<
        StorageService,
        | 'getUploadUrl'
        | 'getUploadUrlCAS'
        | 'getDownloadUrl'
        | 'getPublicUrl'
        | 'putObject'
        | 'getObject'
        | 'getObjectStream'
        | 'getObjectSize'
        | 'deleteObject'
        | 'deleteObjects'
        | 'objectExists'
        | 'copyObject'
        | 'resolveBucket'
        // | 'promoteFromStaging'
        // | 'initMultipartUpload'
        // | 'getResumablePartUrls'
        // | 'completeMultipartUpload'
        // | 'abortMultipartUpload'
    > & { stagingBucket: string }
> = {
    getUploadUrl: vi.fn(),
    getUploadUrlCAS: vi.fn(),
    getDownloadUrl: vi.fn(),
    getPublicUrl: vi.fn(),
    putObject: vi.fn(),
    getObject: vi.fn(),
    getObjectStream: vi.fn(),
    getObjectSize: vi.fn(),
    deleteObject: vi.fn(),
    deleteObjects: vi.fn(),
    objectExists: vi.fn(),
    copyObject: vi.fn(),
    resolveBucket: vi.fn((v: string) => v),
    // promoteFromStaging: vi.fn(),
    // initMultipartUpload: vi.fn(),
    // getResumablePartUrls: vi.fn(),
    // completeMultipartUpload: vi.fn(),
    // abortMultipartUpload: vi.fn(),
    stagingBucket: 'nestjs-scaffold-staging',
};

const mockCacheManager = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
};

const mockFileRepo: Mocked<
    Pick<FileRepository, 'create' | 'findById' | 'updateStatus' | 'softDelete' | 'softDeleteMany'>
> = {
    create: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn(),
    softDelete: vi.fn(),
    softDeleteMany: vi.fn(),
};

const mockImageStrategy = new ImageStrategy('USER_PROFILE_IMAGE' as any);
const mockVideoStrategy = new VideoStrategy('USER_POST_VIDEO' as any);
const mockDocumentStrategy = new DocumentStrategy('USER_POST_DOCUMENT' as any);

const mockStrategyRegistry: Mocked<Pick<StrategyRegistry, 'resolve' | 'listAll'>> = {
    resolve: vi.fn(),
    listAll: vi.fn(),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockConfigService = {
    get: vi.fn(),
    getOrThrow: vi.fn(),
};

function buildService() {
    return new FileService(
        mockStorageService as unknown as StorageService,
        mockFileRepo as unknown as FileRepository,
        mockCacheManager as any,
        mockConfigService as any,
        mockStrategyRegistry as unknown as StrategyRegistry
    );
}

function makeFileRecord(overrides: Partial<Record<string, any>> = {}) {
    return {
        id: 'file_1',
        userId: 'u_1',
        domain: 'USER_PROFILE_IMAGE',
        bucket: 'public',
        bucketKey: 'images/00000000-0000-7000-0000-000000000001',
        filename: 'photo.png',
        contentType: 'image/png',
        status: 'ACTIVE',
        uploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    } as any;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('FileService', () => {
    let service: FileService;

    beforeEach(() => {
        vi.clearAllMocks();
        mockCacheManager.set.mockResolvedValue(undefined);
        mockCacheManager.del.mockResolvedValue(undefined);
        mockCacheManager.get.mockResolvedValue(undefined);
        mockStorageService.resolveBucket.mockImplementation((v: string) => v.toLowerCase());
        mockStrategyRegistry.resolve.mockImplementation((domain: string) => {
            if (domain === 'USER_PROFILE_IMAGE') return mockImageStrategy;
            if (domain === 'USER_POST_VIDEO') return mockVideoStrategy;
            if (domain === 'USER_POST_DOCUMENT') return mockDocumentStrategy;
            throw new FileInvalidDomainException({ message: `Unknown domain: ${domain}` });
        });
        service = buildService();
    });

    // ── getPresignedUploadUrl ─────────────────────────────────────────────────

    describe('getPresignedUploadUrl', () => {
        it('should return fileId and uploadUrl for image domain', async () => {
            mockStorageService.getUploadUrl.mockResolvedValue('https://s3.example.com/presign');
            mockFileRepo.create.mockResolvedValue(makeFileRecord({ id: 'file_new' }));

            const result = await service.getPresignedUploadUrl('u_1', {
                domain: 'USER_PROFILE_IMAGE',
                contentType: 'image/png',
                filename: 'photo.png',
                fileSize: 204800,
            } as any);

            expect(result).toEqual({
                fileId: 'file_new',
                uploadUrl: 'https://s3.example.com/presign',
            });
            expect(mockStorageService.getUploadUrl).toHaveBeenCalledWith(
                'public',
                expect.stringContaining('images/'),
                'image/png'
            );
            expect(mockFileRepo.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 'u_1',
                    domain: 'USER_PROFILE_IMAGE',
                    bucket: 'public',
                })
            );
        });

        it('should return fileId and uploadUrl for video domain', async () => {
            mockStorageService.getUploadUrl.mockResolvedValue('https://s3.example.com/video');
            mockFileRepo.create.mockResolvedValue(
                makeFileRecord({ id: 'file_video', domain: 'video', bucket: 'public' })
            );

            const result = await service.getPresignedUploadUrl('u_2', {
                domain: 'USER_POST_VIDEO',
                contentType: 'video/mp4',
                filename: 'clip.mp4',
                fileSize: 10485760,
            } as any);

            expect(result.fileId).toBe('file_video');
            expect(mockStorageService.getUploadUrl).toHaveBeenCalledWith(
                'public',
                expect.stringContaining('videos/'),
                'video/mp4'
            );
        });

        it('should throw FileInvalidDomainException for unknown domain', async () => {
            await expect(
                service.getPresignedUploadUrl('u_1', {
                    domain: 'unknown',
                    contentType: 'image/png',
                    filename: 'photo.png',
                } as any)
            ).rejects.toBeInstanceOf(FileInvalidDomainException);
        });

        it('should throw FileInvalidTypeException for invalid content type', async () => {
            await expect(
                service.getPresignedUploadUrl('u_1', {
                    domain: 'USER_PROFILE_IMAGE',
                    contentType: 'video/mp4',
                    filename: 'video.mp4',
                    fileSize: 204800,
                } as any)
            ).rejects.toBeInstanceOf(FileInvalidTypeException);
        });

        it('should use standard upload (CAS flow is disabled)', async () => {
            mockStorageService.getUploadUrl.mockResolvedValue('https://s3.example.com/presign');
            mockFileRepo.create.mockResolvedValue(makeFileRecord({ id: 'file_std' }));

            const result = await service.getPresignedUploadUrl('u_1', {
                domain: 'USER_PROFILE_IMAGE',
                contentType: 'image/png',
                filename: 'photo.png',
                fileSize: 204800,
            } as any);

            expect(result.fileId).toBe('file_std');
            expect(mockStorageService.getUploadUrl).toHaveBeenCalled();
            expect(mockStorageService.getUploadUrlCAS).not.toHaveBeenCalled();
        });
    });

    // ── confirmUpload ─────────────────────────────────────────────────────────

    describe('confirmUpload', () => {
        it('should activate file record (non-CAS)', async () => {
            const record = makeFileRecord({ status: 'PENDING' });
            const activeRecord = makeFileRecord({ status: 'ACTIVE' });
            mockFileRepo.findById.mockResolvedValue(record);
            mockFileRepo.updateStatus.mockResolvedValue(activeRecord);

            const result = await service.confirmUpload({ fileId: 'file_1' } as any);

            expect(result.status).toBe('ACTIVE');
            expect(mockFileRepo.updateStatus).toHaveBeenCalledWith('file_1', 'ACTIVE');
        });

        // it('should promote from staging and activate for CAS flow', async () => {
        //     const sha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        //     const record = makeFileRecord({ status: 'PENDING', sha256 });
        //     const activeRecord = makeFileRecord({ status: 'ACTIVE', sha256 });
        //     mockFileRepo.findById.mockResolvedValue(record);
        //     mockStorageService.objectExists.mockResolvedValue(true);
        //     mockStorageService.promoteFromStaging.mockResolvedValue(undefined);
        //     mockFileRepo.updateStatus.mockResolvedValue(activeRecord);
        //
        //     const result = await service.confirmUpload({ fileId: 'file_1' } as any);
        //
        //     expect(mockStorageService.objectExists).toHaveBeenCalledWith(
        //         'nestjs-scaffold-staging',
        //         sha256
        //     );
        //     expect(mockStorageService.promoteFromStaging).toHaveBeenCalledWith(
        //         sha256,
        //         record.bucket,
        //         record.key
        //     );
        //     expect(mockCacheManager.del).toHaveBeenCalledWith('cas:pending:file_1');
        //     expect(result.status).toBe('ACTIVE');
        // });

        // it('should throw FileStagingNotFoundException when staging object missing', async () => {
        //     const sha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        //     mockFileRepo.findById.mockResolvedValue(makeFileRecord({ sha256 }));
        //     mockStorageService.objectExists.mockResolvedValue(false);
        //
        //     await expect(service.confirmUpload({ fileId: 'file_1' } as any)).rejects.toBeInstanceOf(
        //         FileStagingNotFoundException
        //     );
        //     expect(mockStorageService.promoteFromStaging).not.toHaveBeenCalled();
        // });

        it('should throw FileRecordNotFoundException for unknown fileId', async () => {
            mockFileRepo.findById.mockResolvedValue(null);

            await expect(
                service.confirmUpload({ fileId: 'nonexistent' } as any)
            ).rejects.toBeInstanceOf(FileRecordNotFoundException);
        });
    });

    // ── getPresignedDownloadUrl ───────────────────────────────────────────────

    describe('getPresignedDownloadUrl', () => {
        it('should return download presigned URL', async () => {
            mockFileRepo.findById.mockResolvedValue(
                makeFileRecord({
                    domain: 'video',
                    bucket: 'private',
                    bucketKey: 'videos/u_1/123.mp4',
                })
            );
            mockStorageService.getDownloadUrl.mockResolvedValue('https://s3.example.com/download');

            const result = await service.getPresignedDownloadUrl({
                fileId: 'file_1',
                expiresIn: 7200,
            } as any);

            expect(result).toBe('https://s3.example.com/download');
            expect(mockStorageService.getDownloadUrl).toHaveBeenCalledWith(
                'private',
                'videos/u_1/123.mp4',
                7200
            );
        });
    });

    // ── getPublicUrl ─────────────────────────────────────────────────────────

    describe('getPublicUrl', () => {
        it('should return public URL', async () => {
            mockFileRepo.findById.mockResolvedValue(
                makeFileRecord({ bucketKey: 'avatars/u_1/photo.png' })
            );
            mockStorageService.getPublicUrl.mockReturnValue(
                'https://cdn.example.com/public/avatars/u_1/photo.png'
            );

            const result = await service.getPublicUrl('file_1');

            expect(result).toBe('https://cdn.example.com/public/avatars/u_1/photo.png');
            expect(mockStorageService.getPublicUrl).toHaveBeenCalledWith('avatars/u_1/photo.png');
        });
    });

    // ── serverUpload ──────────────────────────────────────────────────────────

    describe('serverUpload', () => {
        it('should upload and return fileId', async () => {
            mockStorageService.putObject.mockResolvedValue(undefined);
            mockFileRepo.create.mockResolvedValue(makeFileRecord({ id: 'file_server' }));

            const mockStrategy = {
                domain: 'USER_PROFILE_IMAGE',
                visibility: 'PUBLIC',
                bucketType: 'PUBLIC',
                bucketKeyPrefix: 'images/profile/',
                listDomains: vi.fn(),
                resolveKey: vi.fn((id: string) => 'images/profile/' + id),
                validate: vi.fn(),
                createUploadHandler: vi.fn(),
                getHandler: vi.fn(),
                getHandlerType: vi.fn().mockReturnValue('buffer'),
                getData: vi.fn(),
                getFiles: vi.fn().mockReturnValue([
                    {
                        id: '00000000-0000-7000-0000-000000000001',
                        filename: 'photo.jpg',
                        buffer: Buffer.from('data'),
                        mimetype: 'image/jpeg',
                    },
                ]),
            } as any;

            const result = await service.serverUpload('u_1', mockStrategy);

            expect(result).toEqual([{ fileId: 'file_server' }]);
            expect(mockStorageService.putObject).toHaveBeenCalledWith(
                'public',
                'images/profile/00000000-0000-7000-0000-000000000001',
                expect.any(Buffer),
                'image/jpeg'
            );
        });
    });

    // ── proxyDownload ────────────────────────────────────────────────────────

    describe('proxyDownload', () => {
        it('should use Stream (buffer path is disabled)', async () => {
            const stream = new Readable({ read() {} });
            mockFileRepo.findById.mockResolvedValue(makeFileRecord({ filename: 'photo.png' }));
            mockStorageService.getObjectStream.mockResolvedValue(stream);

            const result = await service.proxyDownload('file_1');

            expect(result.isStream).toBe(true);
            expect(result.data).toBe(stream);
            expect(result.filename).toBe('photo.png');
            expect(mockStorageService.getObjectStream).toHaveBeenCalled();
            expect(mockStorageService.getObject).not.toHaveBeenCalled();
        });

        it('should use Stream when file size > 5MB', async () => {
            const stream = new Readable({ read() {} });
            mockFileRepo.findById.mockResolvedValue(makeFileRecord({ filename: 'clip.mp4' }));
            mockStorageService.getObjectSize.mockResolvedValue(10 * 1024 * 1024); // 10MB
            mockStorageService.getObjectStream.mockResolvedValue(stream);

            const result = await service.proxyDownload('file_1');

            expect(result.isStream).toBe(true);
            expect(result.data).toBe(stream);
            expect(result.filename).toBe('clip.mp4');
            expect(mockStorageService.getObjectStream).toHaveBeenCalled();
            expect(mockStorageService.getObject).not.toHaveBeenCalled();
        });

        it('should throw FileRecordNotFoundException for unknown fileId', async () => {
            mockFileRepo.findById.mockResolvedValue(null);

            await expect(service.proxyDownload('nonexistent')).rejects.toBeInstanceOf(
                FileRecordNotFoundException
            );
        });
    });

    // ── deleteFiles ──────────────────────────────────────────────────────────

    describe('deleteFiles', () => {
        it('should call deleteObject for single file', async () => {
            mockFileRepo.findById.mockResolvedValue(makeFileRecord());
            mockStorageService.deleteObject.mockResolvedValue(undefined);
            mockFileRepo.softDeleteMany.mockResolvedValue({ count: 1 });

            await service.deleteFiles({ fileIds: ['file_1'] } as any);

            expect(mockStorageService.deleteObject).toHaveBeenCalledWith(
                'public',
                'images/00000000-0000-7000-0000-000000000001'
            );
            expect(mockStorageService.deleteObjects).not.toHaveBeenCalled();
            expect(mockFileRepo.softDeleteMany).toHaveBeenCalledWith(['file_1']);
        });

        it('should call deleteObjects for multiple files in same bucket', async () => {
            mockFileRepo.findById
                .mockResolvedValueOnce(
                    makeFileRecord({ id: 'file_1', bucketKey: 'a.pdf', bucket: 'private' })
                )
                .mockResolvedValueOnce(
                    makeFileRecord({ id: 'file_2', bucketKey: 'b.pdf', bucket: 'private' })
                );
            mockStorageService.deleteObjects.mockResolvedValue(undefined);
            mockFileRepo.softDeleteMany.mockResolvedValue({ count: 2 });

            await service.deleteFiles({ fileIds: ['file_1', 'file_2'] } as any);

            expect(mockStorageService.deleteObjects).toHaveBeenCalledWith('private', [
                'a.pdf',
                'b.pdf',
            ]);
            expect(mockStorageService.deleteObject).not.toHaveBeenCalled();
        });

        it('should throw FileRecordNotFoundException for unknown fileId', async () => {
            mockFileRepo.findById.mockResolvedValue(null);

            await expect(
                service.deleteFiles({ fileIds: ['nonexistent'] } as any)
            ).rejects.toBeInstanceOf(FileRecordNotFoundException);
        });
    });

    // ── fileExists ───────────────────────────────────────────────────────────

    describe('fileExists', () => {
        it('should return true when object exists', async () => {
            mockFileRepo.findById.mockResolvedValue(makeFileRecord());
            mockStorageService.objectExists.mockResolvedValue(true);

            expect(await service.fileExists('file_1')).toBe(true);
        });

        it('should return false when object does not exist', async () => {
            mockFileRepo.findById.mockResolvedValue(makeFileRecord());
            mockStorageService.objectExists.mockResolvedValue(false);

            expect(await service.fileExists('file_1')).toBe(false);
        });
    });

    // ── copyFile ─────────────────────────────────────────────────────────────

    // describe('copyFile', () => {
    //     it('should copy file and return new fileId', async () => {
    //         mockFileRepo.findById.mockResolvedValue(makeFileRecord());
    //         mockStorageService.copyObject.mockResolvedValue(undefined);
    //         mockFileRepo.create.mockResolvedValue(
    //             makeFileRecord({ id: 'file_copy', domain: 'AVATAR' })
    //         );
    //         mockFileRepo.updateStatus.mockResolvedValue(
    //             makeFileRecord({ id: 'file_copy', status: 'ACTIVE' })
    //         );
    //
    //         const result = await service.copyFile('u_1', {
    //             fileId: 'file_1',
    //             destDomain: 'AVATAR',
    //         } as any);
    //
    //         expect(result).toEqual({ fileId: 'file_copy' });
    //         expect(mockStorageService.copyObject).toHaveBeenCalled();
    //     });
    // });

    // ── initMultipartUpload (disabled) ──────────────────────────────────────

    // describe('initMultipartUpload', () => {
    //     it('should initialize multipart upload and return fileId', async () => {
    //         const storageResult = {
    //             uploadId: 'upload_1',
    //             partUrls: [{ partNumber: 1, url: 'https://s3.example.com/part1' }],
    //         };
    //         mockStorageService.initMultipartUpload.mockResolvedValue(storageResult);
    //         mockFileRepo.create.mockResolvedValue(
    //             makeFileRecord({ id: 'file_multi', uploadId: 'upload_1' })
    //         );
    //
    //         const result = await service.initMultipartUpload('u_1', {
    //             domain: 'video',
    //             contentType: 'video/mp4',
    //             filename: 'movie.mp4',
    //             fileSize: 52428800,
    //         } as any);
    //
    //         expect(result.fileId).toBe('file_multi');
    //         expect(result.uploadId).toBe('upload_1');
    //         expect(result.partUrls).toBe(storageResult.partUrls);
    //         expect(mockFileRepo.create).toHaveBeenCalledWith(
    //             expect.objectContaining({ uploadId: 'upload_1' })
    //         );
    //     });
    //
    //     it('should throw FileInvalidDomainException for invalid domain', async () => {
    //         await expect(
    //             service.initMultipartUpload('u_1', {
    //                 domain: 'invalid',
    //                 contentType: 'video/mp4',
    //                 filename: 'movie.mp4',
    //                 partCount: 2,
    //             } as any)
    //         ).rejects.toBeInstanceOf(FileInvalidDomainException);
    //     });
    // });

    // ── resumeMultipartUpload (disabled) ────────────────────────────────────

    // describe('resumeMultipartUpload', () => {
    //     it('should return resumable part URLs', async () => { ... });
    // });

    // ── completeMultipartUpload (disabled) ──────────────────────────────────

    // describe('completeMultipartUpload', () => {
    //     it('should complete and activate file record', async () => { ... });
    // });

    // ── abortMultipartUpload (disabled) ─────────────────────────────────────

    // describe('abortMultipartUpload', () => {
    //     it('should abort multipart upload and soft delete record', async () => { ... });
    // });
});
