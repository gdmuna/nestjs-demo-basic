import { AppService } from '@/app.service';

describe('AppService', () => {
    let service: AppService;

    beforeEach(() => {
        service = new AppService();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return "Hello World!" from getHello()', () => {
        expect(service.getHello()).toBe('Hello World!');
    });
});
