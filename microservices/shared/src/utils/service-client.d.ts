import { AxiosRequestConfig } from 'axios';
import { ServiceResponse } from '../types';
export declare class ServiceClient {
    private client;
    private serviceName;
    constructor(baseURL: string, serviceName: string, timeout?: number);
    private setupInterceptors;
    get<T>(url: string, config?: AxiosRequestConfig): Promise<ServiceResponse<T>>;
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ServiceResponse<T>>;
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ServiceResponse<T>>;
    patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ServiceResponse<T>>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<ServiceResponse<T>>;
    withAuth(token: string): {
        get: <T>(url: string, config?: AxiosRequestConfig) => Promise<ServiceResponse<T>>;
        post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<ServiceResponse<T>>;
        put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<ServiceResponse<T>>;
        patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<ServiceResponse<T>>;
        delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<ServiceResponse<T>>;
    };
}
//# sourceMappingURL=service-client.d.ts.map