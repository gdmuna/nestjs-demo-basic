import { AppService } from '@/app.service';
import { PrismaService } from '@/common/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

describe('AppService', () => {
    let service: AppService;
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            providers: [AppService, PrismaService, ConfigService],
        }).compile();
        service = module.get(AppService);
    });

    afterAll(async () => {
        await module.close();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return "Hello World!" from getHello()', () => {
        expect(service.getHello()).toBe('Hello World!');
    });

    it('getHealth should return status ok and timestamp', async () => {
        const res: any = await service.getHealth();
        expect(res).toHaveProperty('status', 'ok');
        expect(res).toHaveProperty('timestamp');
        expect(new Date(res.timestamp).toString()).not.toContain('Invalid');
    });
});
