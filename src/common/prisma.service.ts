import { Injectable, OnModuleDestroy } from '@nestjs/common';
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@root/prisma/generated/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
    constructor() {
        const DB_URL = process.env.DB_URL;
        if (!DB_URL) {
            throw new Error('DB_URL environment variable is not set');
        }
        const adapter = new PrismaPg({
            connectionString: DB_URL,
        });
        super({ adapter });
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
