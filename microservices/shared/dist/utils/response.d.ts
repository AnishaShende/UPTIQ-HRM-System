import { Response } from 'express';
import { ApiResponse } from '../types';
export declare const successResponse: <T>(data: T, message?: string, meta?: any) => ApiResponse<T>;
export declare const errorResponse: (message: string, statusCode?: number, details?: any) => ApiResponse;
export declare class ResponseHelper {
    static success<T>(res: Response, data: T, statusCode?: number, meta?: any): Response;
    static error(res: Response, message: string, statusCode?: number, details?: any): Response;
    static created<T>(res: Response, data: T): Response;
    static noContent(res: Response): Response;
    static badRequest(res: Response, message?: string, details?: any): Response;
    static unauthorized(res: Response, message?: string): Response;
    static forbidden(res: Response, message?: string): Response;
    static notFound(res: Response, message?: string): Response;
    static conflict(res: Response, message?: string): Response;
    static internalError(res: Response, message?: string): Response;
    static serviceUnavailable(res: Response, message?: string): Response;
}
//# sourceMappingURL=response.d.ts.map