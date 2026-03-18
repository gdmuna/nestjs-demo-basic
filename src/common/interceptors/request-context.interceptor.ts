// import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { RequestContextService } from '@/common/request-context.service.js';
// import { Request } from 'express';

// /**
//  * @description 全局请求拦截器
//  */
// @Injectable()
// export class RequestContextInterceptor implements NestInterceptor {
//     intercept(context: ExecutionContext, next: CallHandler) {
//         const ctx = context.switchToHttp();
//         const request = ctx.getRequest<Request>();
//         const requestContext = {
//             requestId:
//                 typeof request.id === 'string' ? request.id : String(request.id ?? 'unknown'),
//             timestamp: Date.now(),
//             version: request.version,
//         };
//         return new Observable((subscriber) => {
//             RequestContextService.run(requestContext, () => {
//                 next.handle().subscribe(subscriber);
//             });
//         });
//     }
// }
