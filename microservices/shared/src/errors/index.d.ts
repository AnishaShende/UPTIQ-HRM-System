export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly timestamp: string;
    readonly details?: any;
    constructor(message: string, statusCode?: number, isOperational?: boolean, details?: any);
}
export declare class ValidationError extends AppError {
    constructor(message: string, details?: any);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare class ServiceUnavailableError extends AppError {
    constructor(message?: string);
}
export declare class DatabaseError extends AppError {
    constructor(message?: string);
}
export declare class ExternalServiceError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=index.d.ts.map