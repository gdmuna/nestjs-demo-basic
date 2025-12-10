import { Test, TestingModule } from '@nestjs/testing';
import { ColaService } from '@/modules/cola/cola.service';

describe('ColaService', () => {
    let service: ColaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ColaService],
        }).compile();

        service = module.get<ColaService>(ColaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
