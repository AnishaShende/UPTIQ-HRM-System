import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ServiceRequest, ServiceResponse } from '../types';
import { ExternalServiceError } from '../errors';

export class ServiceClient {
  private client: AxiosInstance;
  private serviceName: string;

  constructor(baseURL: string, serviceName: string, timeout: number = 5000) {
    this.serviceName = serviceName;
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add service metadata
    this.client.interceptors.request.use((config) => {
      config.headers['X-Service-Name'] = this.serviceName;
      config.headers['X-Request-ID'] = '';
      return config;
    });

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.error?.message || error.message;
        const statusCode = error.response?.status || 500;
        throw new ExternalServiceError(`${this.serviceName} service error: ${message}`);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ServiceResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ServiceResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ServiceResponse<T>> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ServiceResponse<T>> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ServiceResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // Method to call with authentication
  withAuth(token: string) {
    return {
      get: <T>(url: string, config?: AxiosRequestConfig) => 
        this.get<T>(url, { ...config, headers: { ...config?.headers, Authorization: `Bearer ${token}` } }),
      post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
        this.post<T>(url, data, { ...config, headers: { ...config?.headers, Authorization: `Bearer ${token}` } }),
      put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
        this.put<T>(url, data, { ...config, headers: { ...config?.headers, Authorization: `Bearer ${token}` } }),
      patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
        this.patch<T>(url, data, { ...config, headers: { ...config?.headers, Authorization: `Bearer ${token}` } }),
      delete: <T>(url: string, config?: AxiosRequestConfig) => 
        this.delete<T>(url, { ...config, headers: { ...config?.headers, Authorization: `Bearer ${token}` } })
    };
  }
}