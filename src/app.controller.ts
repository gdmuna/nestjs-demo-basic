import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Body, Post, HttpStatus } from '@nestjs/common';
import { BussinessException } from './common/exceptions/business.exception.js';
import { LoginDto } from './app.dto.js';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('hello')
    getHello() {
        return this.appService.getHello();
    }

    @Get('health')
    getHealth() {
        return this.appService.getHealth();
    }

    @Post('login')
    login(@Body() body: LoginDto) {
        // 模拟登录逻辑，实际应用中应验证用户名和密码
        if (body.username === 'admin' && body.password === 'password') {
            return {
                success: true,
                message: 'Login successful',
                token: 'fake-jwt-token',
            };
        } else {
            throw new BussinessException(
                'Invalid username or password',
                'AUTH_FAILED',
                HttpStatus.UNAUTHORIZED
            );
        }
    }
}
