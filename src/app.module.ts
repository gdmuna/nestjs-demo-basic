import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ColaModule } from './modules/cola/cola.module.js';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ColaModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
