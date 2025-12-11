import { Body as BodyDecorator, Controller, Get, Post, Logger, Query } from '@nestjs/common';
import { ColaService } from './cola.service.js';
import { PrismaService } from '@/common/prisma.service.js';

@Controller('cola')
export class ColaController {
    private readonly logger = new Logger(ColaController.name);

    constructor(
        private readonly colaService: ColaService,
        private readonly prismaService: PrismaService
    ) {}

    @Post('register')
    registerCola(@BodyDecorator() details: ColaBrand) {
        this.logger.log(`Registering new cola brand: ${details}`);
        this.colaService.RegisterCola(details);
        return `Cola brand ${details.name} registered successfully.`;
    }

    @Get()
    getCola(@Query('brand') brand?: string): ColaBrand | undefined {
        brand = brand || 'Coca-Cola';
        this.logger.log(`Fetching details for brand: ${brand}`);
        return this.colaService.getColaCategory(brand);
    }

    @Get('test')
    getTestData() {
        this.logger.log(`Fetching test data from database`);
        return this.prismaService;
    }
}

interface ColaBrand {
    owner: string;
    name: string;
    tags?: string[];
    description?: string;
}
