import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { APP_VERSION } from '@/utils/constants.js';
import { ulid } from 'ulid';

// export interface Request extends OriginalRequest {
//     id: string;
//     version: string;
// }

@Injectable()
export class RequestPreprocessingMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const reqId = req.headers['flx-request-id'] ?? ulid();
        req.id = typeof reqId === 'string' ? reqId : reqId[0];
        res.setHeader('flx-request-id', req.id);
        req.version = APP_VERSION;
        next();
    }
}
