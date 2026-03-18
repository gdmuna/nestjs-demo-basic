// 1. 创建请求上下文服务
// src/common/request-context.service.ts
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import merge from 'lodash/merge.js';

export interface RequestContext {
    requestId: string;
    userId?: string;
    version?: string;
    time: number;
    metadata?: Record<string, any>;
    // 其他需要传递的上下文
}

@Injectable()
export class RequestContextService {
    private static asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

    // 设置当前请求上下文
    static run(context: RequestContext, callback: () => void) {
        this.asyncLocalStorage.run(context, callback);
    }

    // 获取当前请求上下文
    static get(): RequestContext | undefined {
        return this.asyncLocalStorage.getStore();
    }

    // 获取 requestId
    static getRequestId(): string | undefined {
        return this.get()?.requestId;
    }

    static mergeResponseMetadata(metadata: Record<string, any>) {
        const context = this.get();
        if (!context) return;
        context.metadata = merge(context.metadata, metadata);
        return context.metadata;
    }
}
