import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('hello')
    getHello() {
        return this.appService.getHello();
    }

    @Get('health')
    async getHealth() {
        return await this.appService.getHealth();
    }
}
