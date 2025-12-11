import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { PrismaService } from '@/common/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('AppController (unit)', () => {
    let controller: AppController;
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            controllers: [AppController],
            providers: [AppService, PrismaService],
        }).compile();
        controller = module.get(AppController);
    });

    afterEach(async () => {
        await module.get(PrismaService).$disconnect();
    });

    afterAll(async () => {
        await module.close();
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
