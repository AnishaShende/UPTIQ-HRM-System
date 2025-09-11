import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { Request, Response, NextFunction } from 'express';
import { serviceConfig, routeConfig } from '../config/services';
import { createLogger, NotFoundError, ServiceUnavailableError } from '@hrm/shared';

const logger = createLogger('api-gateway');

export const createServiceProxy = (serviceName: string) => {
  const service = serviceConfig[serviceName];
  
  if (!service) {
    throw new Error(`Service ${serviceName} not configured`);
  }

  const proxyOptions: Options = {
    target: service.url,
    changeOrigin: true,
    timeout: service.timeout,
    pathRewrite: {
      // Remove the API version prefix when forwarding to services
      '^/api/v1': '/api/v1'
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${serviceName}:`, err);
      const response = res as Response;
      response.status(503).json({
        success: false,
        error: {
          message: `Service ${serviceName} is currently unavailable`,
          statusCode: 503,
          timestamp: new Date().toISOString()
        }
      });
    },
    onProxyReq: (proxyReq, req) => {
      // Forward request metadata
      const request = req as Request;
      proxyReq.setHeader('X-Gateway-Request-ID', request.requestId || '');
      proxyReq.setHeader('X-Gateway-Service', serviceName);
      proxyReq.setHeader('X-Forwarded-For', request.ip);
      
      // Forward user information if available
      if (request.user) {
        proxyReq.setHeader('X-User-ID', request.user.userId);
        proxyReq.setHeader('X-User-Role', request.user.role);
        proxyReq.setHeader('X-User-Email', request.user.email);
      }

      logger.debug(`Proxying request to ${serviceName}`, {
        method: req.method,
        url: req.url,
        target: service.url
      });
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add service information to response headers
      res.setHeader('X-Service-Name', serviceName);
      res.setHeader('X-Service-Version', '1.0.0');
      
      logger.debug(`Received response from ${serviceName}`, {
        statusCode: proxyRes.statusCode,
        method: req.method,
        url: req.url
      });
    }
  };

  return createProxyMiddleware(proxyOptions);
};

export const routeToService = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path;
  let targetService: string | undefined;

  // Find matching service based on path
  for (const [route, service] of Object.entries(routeConfig)) {
    if (path.startsWith(route)) {
      targetService = service;
      break;
    }
  }

  if (!targetService) {
    throw new NotFoundError(`No service found for path: ${path}`);
  }

  // Check if service is available
  const service = serviceConfig[targetService];
  if (!service) {
    throw new ServiceUnavailableError(`Service ${targetService} is not configured`);
  }

  // Add service info to request for downstream middleware
  req.targetService = targetService;
  next();
};

// Extend Request interface to include target service
declare global {
  namespace Express {
    interface Request {
      targetService?: string;
    }
  }
}