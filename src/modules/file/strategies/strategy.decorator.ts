import { FileDomain } from '@root/prisma/generated/enums.js';
import type { IFileStrategy } from './strategy.interface.js';

/** Strategy 构造函数类型（无参数，返回 IFileStrategy） */
export type StrategyConstructor = new (domain: FileDomain) => IFileStrategy;

/**
 * 模块级 Strategy 类注册表。
 * key: domain 字符串，value: 对应 Strategy 类的构造函数。
 *
 * 在模块加载阶段由 `@RegisterStrategy()` 装饰器写入，
 * 请求阶段由 `StrategyRegistry.resolve(domain)` 读取并实例化。
 */
const STRATEGY_CLASS_REGISTRY = new Map<FileDomain, StrategyConstructor>();

/**
 * 将类注册为文件上传策略。
 *
 * 装饰器在**类加载时**（模块评估阶段）执行，将 `static acceptedDomain` 中的每个 domain
 * 与该类的构造函数关联写入全局注册表，供请求阶段按 domain 实例化。
 *
 * 若同一 domain 已被其他 Strategy 注册，立即抛出错误（Fail-fast）。
 *
 * @example
 * ```ts
 * @RegisterStrategy()
 * export class VideoStrategy implements IFileStrategy {
 *   static readonly acceptedDomain = [FileDomain.VIDEO];
 * }
 * ```
 */
export function RegisterStrategy(): ClassDecorator {
    return (target) => {
        const domains: FileDomain[] =
            (target as unknown as { acceptedDomain?: FileDomain[] }).acceptedDomain ?? [];

        for (const domain of domains) {
            const existing = STRATEGY_CLASS_REGISTRY.get(domain);
            if (existing) {
                throw new Error(
                    `Strategy conflict: domain "${domain}" is already registered by ${existing.name}, cannot re-register with ${(target as { name?: string }).name ?? 'unknown'}`
                );
            }
            STRATEGY_CLASS_REGISTRY.set(domain, target as unknown as StrategyConstructor);
        }
    };
}

/** 根据 domain 获取已注册的 Strategy 构造函数 */
export function getStrategyClass(domain: FileDomain): StrategyConstructor | undefined {
    return STRATEGY_CLASS_REGISTRY.get(domain);
}

/** 返回所有已注册的 domain 列表 */
export function getAllRegisteredDomains(): FileDomain[] {
    return [...STRATEGY_CLASS_REGISTRY.keys()];
}
