import { Injectable, OnModuleDestroy } from '@nestjs/common';
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@root/prisma/generated/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
    constructor() {
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL,
        });
        super({ adapter });
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
