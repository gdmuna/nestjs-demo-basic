import { z } from 'zod/v4';

export const envValidationSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z
        .string()
        .transform((val, ctx) => {
            if (!val) return val;
            const parsed = parseInt(val);
            if (isNaN(parsed) || parsed <= 0 || parsed > 65535) {
                ctx.addIssue({
                    code: 'invalid_type',
                    expected: 'valid port number',
                    received: val,
                });
                return z.NEVER;
            }
            return String(parsed);
        })
        .default('3000'),
    DATABASE_URL: z.url(),
    ALLOWED_ORIGINS_PROD: z
        .string()
        .transform((val, ctx) => {
            val.split(',')
                .filter((o) => o)
                .forEach((origin) => {
                    const ok = z.url().safeParse(origin);
                    if (!ok.success) {
                        ctx.addIssue({
                            code: 'invalid_type',
                            expected: 'comma-separated list of valid URLs',
                            received: val,
                        });
                        return z.NEVER;
                    }
                });
            return val;
        })
        .optional(),
    ALLOWED_ORIGINS_DEV: z
        .string()
        .transform((val, ctx) => {
            val.split(',')
                .filter((o) => o)
                .forEach((origin) => {
                    const ok = z.url().safeParse(origin);
                    if (!ok.success) {
                        ctx.addIssue({
                            code: 'invalid_type',
                            expected: 'comma-separated list of valid URLs',
                            received: val,
                        });
                        return z.NEVER;
                    }
                });
            return val;
        })
        .optional(),
    LOG_LEVEL: z
        .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent', ''])
        .optional(),
    SLOW_REQUEST_WARN_MS: z
        .string()
        .transform((val, ctx) => {
            if (!val) return val;
            const parsed = parseInt(val);
            if (isNaN(parsed) || parsed < 0) {
                ctx.addIssue({
                    code: 'invalid_type',
                    expected: 'non-negative integer',
                    received: val,
                });
                return z.NEVER;
            }
            return String(parsed);
        })
        .optional(),
    SLOW_REQUEST_ERROR_MS: z
        .string()
        .transform((val, ctx) => {
            if (!val) return val;
            const parsed = parseInt(val);
            if (isNaN(parsed) || parsed < 0) {
                ctx.addIssue({
                    code: 'invalid_type',
                    expected: 'non-negative integer',
                    received: val,
                });
                return z.NEVER;
            }
            return String(parsed);
        })
        .optional(),
    SLOW_QUERY_WARN_MS: z
        .string()
        .transform((val, ctx) => {
            if (!val) return val;
            const parsed = parseInt(val);
            if (isNaN(parsed) || parsed < 0) {
                ctx.addIssue({
                    code: 'invalid_type',
                    expected: 'non-negative integer',
                    received: val,
                });
                return z.NEVER;
            }
            return String(parsed);
        })
        .optional(),
    SLOW_QUERY_ERROR_MS: z
        .string()
        .transform((val, ctx) => {
            if (!val) return val;
            const parsed = parseInt(val);
            if (isNaN(parsed) || parsed < 0) {
                ctx.addIssue({
                    code: 'invalid_type',
                    expected: 'non-negative integer',
                    received: val,
                });
                return z.NEVER;
            }
            return String(parsed);
        })
        .optional(),
    REQUEST_TIMEOUT_MS: z
        .string()
        .transform((val, ctx) => {
            if (!val) return val;
            const parsed = parseInt(val);
            if (isNaN(parsed) || parsed < 0) {
                ctx.addIssue({
                    code: 'invalid_type',
                    expected: 'non-negative integer',
                    received: val,
                });
                return z.NEVER;
            }
            return String(parsed);
        })
        .optional(),
    JWT_ACCESS_PRIVATE_KEY: z.string().optional(),
    JWT_ACCESS_PUBLIC_KEY: z.string().optional(),
    JWT_ACCESS_EXPIRES_IN: z.string().optional(),
    JWT_REFRESH_PRIVATE_KEY: z.string().optional(),
    JWT_REFRESH_PUBLIC_KEY: z.string().optional(),
    JWT_REFRESH_EXPIRES_IN: z.string().optional(),
    JWT_REFRESH_COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).optional(),
    JWT_REFRESH_COOKIE_SECURE: z.enum(['true', 'false']).optional(),
    JWT_REFRESH_COOKIE_PATH: z.string().optional(),
    JWT_REFRESH_COOKIE_MAX_AGE_MS: z
        .string()
        .transform((val, ctx) => {
            if (!val) return val;
            const parsed = parseInt(val);
            if (isNaN(parsed) || parsed <= 0) {
                ctx.addIssue({
                    code: 'invalid_type',
                    expected: 'positive integer',
                    received: val,
                });
                return z.NEVER;
            }
            return String(parsed);
        })
        .optional(),
});
