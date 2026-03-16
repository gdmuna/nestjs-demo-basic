declare global {
    namespace Express {
        interface Request {
            id?: string;
            version?: string;
        }
    }
}

export {};
