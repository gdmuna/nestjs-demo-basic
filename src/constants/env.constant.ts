import 'dotenv/config';

export const DEFAULT_PORT = Number(process.env.PORT);

export const IS_DEV = process.env.NODE_ENV === 'development';

export const IS_TEST = process.env.NODE_ENV === 'test';

export const IS_PROD = process.env.NODE_ENV === 'production';
