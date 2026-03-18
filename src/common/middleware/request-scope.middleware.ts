import { Injectable, NestMiddleware } from '@nestjs/common';
import { RequestContextService } from '@/common/request-context.service.js';
import { Request, Response, NextFunction } from 'express';

/**
 * @description
 */
@Injectable()
export class RequestScopeMiddleware implements NestMiddleware {
    use(req: Request, _: Response, next: NextFunction) {
        const requestContext = {
            requestId: typeof req.id === 'string' ? req.id : String(req.id ?? 'unknown'),
            time: Date.now(),
            version: req.version,
        };
        RequestContextService.run(requestContext, () => {
            next();
        });
    }
}
