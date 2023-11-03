export {};

declare global {
    namespace Express {
        export interface Request {
            context: Map<string, any>;
            getHeader: (header: string) => string | undefined;
            getNumHeader: (header: string) => number | undefined;
            files?: Record<string, SentFile>;

            hasHeader(header: string): boolean;
        }
    }
}
