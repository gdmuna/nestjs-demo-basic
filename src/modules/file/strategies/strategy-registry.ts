import { Injectable } from '@nestjs/common';

import { getStrategyClass, getAllRegisteredDomains } from './strategy.decorator.js';
import type { IFileStrategy, IStrategyRegistry } from './strategy.interface.js';
import { FileInvalidDomainException } from '../file.exception.js';
import { FileDomain } from '@root/prisma/generated/enums.js';

/**
 * Strategy 注册表服务。
 *
 * 不再依赖 NestJS 依赖注入来收集 Strategy 实例；而是在**请求阶段**从
 * `strategy.decorator.ts` 维护的模块级类注册表中按 domain 取出构造函数，
 * 调用 `new StrategyClass()` 创建**当次请求专用**的新实例。
 *
 * 所有 Strategy 文件在 `strategies/index.ts` 中被 re-export，模块加载时
 * 各文件的 `@RegisterStrategy()` 装饰器自动将构造函数写入全局注册表，
 * 因此 `StrategyRegistry` 无需任何构造函数参数。
 */
@Injectable()
export class StrategyRegistry implements IStrategyRegistry {
    /**
     * 根据 domain 实例化对应的 Strategy（每次请求产生新实例）。
     * @throws FileInvalidDomainException 若 domain 未注册
     */
    resolve(domain: FileDomain): IFileStrategy {
        const StrategyClass = getStrategyClass(domain);
        if (!StrategyClass) {
            throw new FileInvalidDomainException({
                message: `没有找到处理 domain "${domain}" 的上传策略，支持：${getAllRegisteredDomains().join(', ')}`,
            });
        }
        return new StrategyClass(domain);
    }

    /** 每个已注册 domain 各实例化一个 Strategy，返回全量列表 */
    listAll(): IFileStrategy[] {
        return getAllRegisteredDomains().map((domain) => this.resolve(domain));
    }
}
