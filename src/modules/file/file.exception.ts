import { RegisterException, ClientException } from '@/common/exceptions/index.js';

export const FileExceptionCode = {
    INVALID_FILE_TYPE: 'FILE_INVALID_TYPE',
    INVALID_DOMAIN: 'FILE_INVALID_DOMAIN',
    RECORD_NOT_FOUND: 'FILE_RECORD_NOT_FOUND',
} as const;

export abstract class FileException extends ClientException {}

@RegisterException({
    code: FileExceptionCode.INVALID_FILE_TYPE,
    statusCode: 422,
    message: '不支持的文件类型',
    description: '上传文件的 MIME 类型与所选领域（domain）不匹配，请确认文件类型后重新上传',
    retryable: false,
    logLevel: 'info',
    causes: ['文件 MIME 类型不在该领域的允许列表内'],
    hint: '查看该领域（domain）支持的文件类型列表，更换符合要求的文件后重试',
})
export class FileInvalidTypeException extends FileException {}

@RegisterException({
    code: FileExceptionCode.INVALID_DOMAIN,
    statusCode: 400,
    message: '无效的文件领域',
    description: '提供的文件领域（domain）不在系统支持的范围内',
    retryable: false,
    logLevel: 'info',
    causes: ['domain 参数不在 avatar / video / document 取值范围内'],
    hint: '使用合法的 domain 值：avatar、video 或 document',
})
export class FileInvalidDomainException extends FileException {}

@RegisterException({
    code: FileExceptionCode.RECORD_NOT_FOUND,
    statusCode: 404,
    message: '文件记录不存在',
    description: '指定的文件 ID 在系统中未找到对应的记录',
    retryable: false,
    logLevel: 'info',
    causes: ['fileId 不存在或已被删除'],
    hint: '确认 fileId 正确，或重新上传文件',
})
export class FileRecordNotFoundException extends FileException {}
