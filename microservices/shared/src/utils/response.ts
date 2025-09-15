import { Response } from 'express';
import { ApiResponse } from '../types';

export const successResponse = <T>(data: T, message?: string, meta?: any): ApiResponse<T> => {
  return {
    success: true,
    data,
    meta
  };
};

export const errorResponse = (message: string, statusCode: number = 500, details?: any): ApiResponse => {
  return {
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      details
    }
  };
};

export class ResponseHelper {
  static success<T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    meta?: any
  ): Response | void {
    if (res.headersSent) {
      return;
    }
    
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    details?: any
  ): Response | void {
    if (res.headersSent) {
      return;
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        message,
        statusCode,
        timestamp: new Date().toISOString(),
        details
      }
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T): Response | void {
    return this.success(res, data, 201);
  }

  static noContent(res: Response): Response | void {
    if (res.headersSent) {
      return;
    }
    return res.status(204).send();
  }

  static badRequest(res: Response, message: string = 'Bad Request', details?: any): Response | void {
    return this.error(res, message, 400, details);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response | void {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response | void {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message: string = 'Not Found'): Response | void {
    return this.error(res, message, 404);
  }

  static conflict(res: Response, message: string = 'Conflict'): Response | void {
    return this.error(res, message, 409);
  }

  static internalError(res: Response, message: string = 'Internal Server Error'): Response | void {
    return this.error(res, message, 500);
  }

  static serviceUnavailable(res: Response, message: string = 'Service Unavailable'): Response | void {
    return this.error(res, message, 503);
  }
}