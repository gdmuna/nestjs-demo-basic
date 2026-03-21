/**
 * 加密和哈希工具 - UUID生成、哈希、密码等。
 * 注意：密码哈希建议使用 bcrypt/argon2 等专业库。
 */

import { randomBytes, createHash } from 'crypto';

/**
 * 生成随机的十六进制字符串。
 * 常用于会话ID、令牌等。
 *
 * @param length - 生成的字节数，默认16（32个十六进制字符）
 * @returns 十六进制字符串
 *
 * @example
 * generateRandomHex() // 'd4f8a3b2c9e1f5a7...'
 * generateRandomHex(8) // 'a1b2c3d4'
 */
export function generateRandomHex(length: number = 16): string {
    return randomBytes(length).toString('hex');
}

/**
 * 计算字符串的 SHA-256 哈希值。
 *
 * @param value - 待哈希的字符串
 * @returns 十六进制哈希值
 *
 * @example
 * hashSHA256('password123') // 'ef92b778...'
 */
export function hashSHA256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
}

/**
 * 计算字符串的 SHA-1 哈希值（已过时，仅用于兼容性）。
 *
 * @deprecated 使用 hashSHA256 或 hashSHA512 代替
 * @param value - 待哈希的字符串
 * @returns 十六进制哈希值
 */
export function hashSHA1(value: string): string {
    return createHash('sha1').update(value).digest('hex');
}

/**
 * 计算字符串的 SHA-512 哈希值。
 * 提供比 SHA-256 更高的安全性。
 *
 * @param value - 待哈希的字符串
 * @returns 十六进制哈希值
 */
export function hashSHA512(value: string): string {
    return createHash('sha512').update(value).digest('hex');
}

/**
 * 计算字符串的 MD5 哈希值（已过时，仅用于兼容性）。
 *
 * @deprecated MD5 存在碰撞漏洞，不应用于安全场合
 * @param value - 待哈希的字符串
 * @returns 十六进制哈希值
 */
export function hashMD5(value: string): string {
    return createHash('md5').update(value).digest('hex');
}

/**
 * 使用盐生成哈希值（简单实现）。
 * 用于密码相关场合，但建议用 bcrypt/argon2 替代此函数。
 *
 * @param value - 待哈希的值
 * @param salt - 盐值（如果不提供，将随机生成）
 * @returns { hash: 哈希值, salt: 使用的盐值 }
 *
 * @example
 * const { hash, salt } = hashWithSalt('password123');
 * // 用户表存储 hash 和 salt
 * // 验证时：hashWithSalt('inputPassword', salt).hash === storedHash
 *
 * @warning 此实现仅用于演示，生产环境应使用 bcrypt 或 argon2
 */
export function hashWithSalt(value: string, salt?: string): { hash: string; salt: string } {
    const usedSalt = salt || generateRandomHex(16);
    const hash = hashSHA256(value + usedSalt);
    return { hash, salt: usedSalt };
}

/**
 * 生成指定长度的随机字母数字字符串。
 * 常用于验证码、临时密码等。
 *
 * @param length - 生成的字符数，默认10
 * @param charset - 字符集（默认：大小写字母 + 数字）
 * @returns 随机字符串
 *
 * @example
 * generateRandomString(6) // 'aBc1De'
 * generateRandomString(10, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')  // 'ABCDEFGHIJ'
 */
export function generateRandomString(
    length: number = 10,
    charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
    let result = '';
    const bytes = randomBytes(length);

    for (let i = 0; i < length; i++) {
        result += charset[bytes[i] % charset.length];
    }

    return result;
}

/**
 * 生成纯数字的随机字符串（如验证码）。
 *
 * @param length - 生成的数字个数，默认6
 * @returns 数字字符串
 *
 * @example
 * generateRandomDigits() // '123456'
 * generateRandomDigits(4) // '7234'
 */
export function generateRandomDigits(length: number = 6): string {
    return generateRandomString(length, '0123456789');
}

/**
 * 计算对象或字符串的简单哈希值（不加密，用于校验和）。
 * 使用JSON序列化 + SHA-256。
 *
 * @param value - 待哈希的对象或字符串
 * @returns 十六进制哈希值
 *
 * @example
 * const obj = { a: 1, b: 2 };
 * const hash1 = objectHash(obj);
 * const hash2 = objectHash({ a: 1, b: 2 });
 * console.log(hash1 === hash2); // true（相同的内容产生相同的哈希）
 */
export function objectHash(value: any): string {
    const json = typeof value === 'string' ? value : JSON.stringify(value, null, 0);
    return hashSHA256(json);
}

/**
 * 计算字符串的校验和（基于 Luhn 算法）。
 * 常用于银行卡号、身份证验证等。
 *
 * @param value - 数字字符串
 * @returns 校验位（0-9）
 *
 * @example
 * luhnChecksum('79927398713') // 0 (校验位)
 */
export function luhnChecksum(value: string): number {
    const digits = value.split('').reverse();
    let sum = 0;

    for (let i = 0; i < digits.length; i++) {
        let digit = parseInt(digits[i], 10);

        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
    }

    return (10 - (sum % 10)) % 10;
}

/**
 * 验证字符串是否符合 Luhn 算法（包含校验位）。
 *
 * @param value - 完整的数字字符串（包含校验位）
 * @returns 是否有效
 *
 * @example
 * verifyLuhn('79927398713') // true
 * verifyLuhn('79927398714') // false
 */
export function verifyLuhn(value: string): boolean {
    if (!/^\d+$/.test(value) || value.length < 2) return false;

    const checksum = luhnChecksum(value.slice(0, -1));
    return checksum === parseInt(value[value.length - 1], 10);
}
