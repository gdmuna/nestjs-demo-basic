import { Module } from '@nestjs/common';
import { ColaController } from './cola.controller.js';
import { ColaService } from './cola.service.js';
import { PrismaService } from '@/common/prisma.service.js';

@Module({
    controllers: [ColaController],
    providers: [ColaService, PrismaService],
})
export class ColaModule {}
