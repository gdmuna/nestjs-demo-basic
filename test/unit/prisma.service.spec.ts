import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/common/prisma.service';

describe('PrismaService', () => {
    let service: PrismaService;
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            providers: [PrismaService],
        }).compile();
        service = module.get(PrismaService);
    });

    afterEach(async () => {
        if (service) {
            await service.$disconnect();
        }
    });

    afterAll(async () => {
        if (module) {
            await module.close();
        }
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
