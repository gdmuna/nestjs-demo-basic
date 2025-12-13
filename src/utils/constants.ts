export const DEFAULT_PORT = Number(process.env.PORT);

export const JWT_ACCESS_TOKEN = {
    SECRET_KEY: process.env.JWT_SECRET,
    EXPIRES_IN: '1h',
} as const;

export const JWT_REFRESH_TOKEN = {
    SECRET_KEY: process.env.JWT_SECRET,
    EXPIRES_IN: '3d',
} as const;
