import axios from 'axios';
import { serviceConfig } from '../config/services';
import { createLogger } from '../utils';

const logger = createLogger('health-checker');

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  lastChecked: Date;
  error?: string;
}

export class HealthChecker {
  private healthStatus: Map<string, ServiceHealth> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(private intervalMs: number = parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000')) {
    this.startHealthChecks();
  }

  startHealthChecks(): void {
    // Initial health check
    this.checkAllServices();

    // Set up periodic health checks
    this.checkInterval = setInterval(() => {
      this.checkAllServices();
    }, this.intervalMs);

    logger.info('Health checker started', { intervalMs: this.intervalMs });
  }

  stopHealthChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('Health checker stopped');
    }
  }

  async checkAllServices(): Promise<void> {
    const promises = Object.entries(serviceConfig).map(([name, config]) =>
      this.checkService(name, config)
    );

    await Promise.allSettled(promises);
  }

  private async checkService(name: string, config: any): Promise<void> {
    const startTime = Date.now();
    const healthUrl = `${config.url}${config.healthCheck}`;

    try {
      const response = await axios.get(healthUrl, {
        timeout: config.timeout,
        validateStatus: (status) => status < 500 // Consider 4xx as healthy
      });

      const responseTime = Date.now() - startTime;
      
      this.healthStatus.set(name, {
        name,
        status: 'healthy',
        responseTime,
        lastChecked: new Date()
      });

      logger.debug(`Service ${name} is healthy`, { responseTime });
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      this.healthStatus.set(name, {
        name,
        status: 'unhealthy',
        responseTime,
        lastChecked: new Date(),
        error: error.message
      });

      logger.warn(`Service ${name} is unhealthy`, { 
        error: error.message,
        responseTime
      });
    }
  }

  getServiceHealth(serviceName: string): ServiceHealth | undefined {
    return this.healthStatus.get(serviceName);
  }

  getAllServiceHealth(): ServiceHealth[] {
    return Array.from(this.healthStatus.values());
  }

  isServiceHealthy(serviceName: string): boolean {
    const health = this.healthStatus.get(serviceName);
    return health?.status === 'healthy';
  }

  getOverallHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: ServiceHealth[];
    summary: {
      total: number;
      healthy: number;
      unhealthy: number;
    };
  } {
    const services = this.getAllServiceHealth();
    const healthy = services.filter(s => s.status === 'healthy').length;
    const total = services.length;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (healthy === 0) {
      status = 'unhealthy';
    } else if (healthy < total) {
      status = 'degraded';
    }

    return {
      status,
      services,
      summary: {
        total,
        healthy,
        unhealthy: total - healthy
      }
    };
  }
}