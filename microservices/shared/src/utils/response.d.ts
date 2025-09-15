import { Response } from 'express';
import { ApiResponse } from '../types';
export declare const successResponse: <T>(data: T, message?: string, meta?: any) => ApiResponse<T>;
export declare const errorResponse: (message: string, statusCode?: number, details?: any) => ApiResponse;
export declare class ResponseHelper {
    static success<T>(res: Response, data: T, statusCode?: number, meta?: any): Response | void;
    static error(res: Response, message: string, statusCode?: number, details?: any): Response | void;
    static created<T>(res: Response, data: T): Response | void;
    static noContent(res: Response): Response | void;
    static badRequest(res: Response, message?: string, details?: any): Response | void;
    static unauthorized(res: Response, message?: string): Response | void;
    static forbidden(res: Response, message?: string): Response | void;
    static notFound(res: Response, message?: string): Response | void;
    static conflict(res: Response, message?: string): Response | void;
    static internalError(res: Response, message?: string): Response | void;
    static serviceUnavailable(res: Response, message?: string): Response | void;
}
//# sourceMappingURL=response.d.ts.map