import { Test, TestingModule } from '@nestjs/testing';
import { ColaController } from '@/modules/cola/cola.controller';
import { ColaService } from '@/modules/cola/cola.service';
import { PrismaService } from '@/common/prisma.service';

describe('ColaController', () => {
    let controller: ColaController;
    let _service: ColaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ColaController],
            providers: [ColaService, PrismaService],
        }).compile();

        controller = module.get<ColaController>(ColaController);
        _service = module.get<ColaService>(ColaService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
