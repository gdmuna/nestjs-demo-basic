import { Injectable, NestInterceptor, CallHandler, ExecutionContext } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        return next.handle().pipe(
            map((data) => ({
                success: true,
                data,
                timestamp: new Date().toISOString(),
                requestId: request.id || 'unknown',
            }))
        );
    }
}
