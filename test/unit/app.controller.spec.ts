import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { PrismaService } from '@/common/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

describe('AppController (unit)', () => {
    let controller: AppController;
    let module: TestingModule;
    let prismaService: PrismaService;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            controllers: [AppController],
            providers: [AppService, PrismaService, ConfigService],
        }).compile();
        controller = module.get(AppController);
        prismaService = module.get(PrismaService);
    });

    afterEach(async () => {
        if (prismaService) {
            await prismaService.$disconnect();
        }
    });

    afterAll(async () => {
        if (module) {
            await module.close();
        }
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getHello should return Hello World!', () => {
        expect(controller.getHello()).toBe('Hello World!');
    });

    it('getHealth should return status ok and timestamp', async () => {
        const res: any = await controller.getHealth();
        expect(res).toHaveProperty('status', 'ok');
        expect(res).toHaveProperty('timestamp');
        expect(new Date(res.timestamp).toString()).not.toContain('Invalid');
    });
});
