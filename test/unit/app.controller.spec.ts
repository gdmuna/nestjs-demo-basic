import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';

describe('AppController (unit)', () => {
    let controller: AppController;
    let service: AppService;

    beforeEach(() => {
        service = new AppService();
        controller = new AppController(service);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getHello should return Hello World!', () => {
        expect(controller.getHello()).toBe('Hello World!');
    });

    it('getHealth should return status ok and timestamp', () => {
        const res: any = controller.getHealth();
        expect(res).toHaveProperty('status', 'ok');
        expect(res).toHaveProperty('timestamp');
        expect(new Date(res.timestamp).toString()).not.toContain('Invalid');
    });
});
