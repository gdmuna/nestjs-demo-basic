/**
 * @description: 业务异常类
 * @example: throw new BussinessException('用户不存在', 'USER_NOT_FOUND', 404);
 */
export class BussinessException extends Error {
    constructor(
        public readonly message: string,
        public readonly code: string,
        public readonly httpStatus: number = 400,
        public readonly details?: any
    ) {
        super(message);
        this.name = 'BussinessException';
    }
}
