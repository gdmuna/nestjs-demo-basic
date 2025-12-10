import { Module } from '@nestjs/common';
import { ColaController } from './cola.controller.js';
import { ColaService } from './cola.service.js';

@Module({
    controllers: [ColaController],
    providers: [ColaService],
})
export class ColaModule {}
