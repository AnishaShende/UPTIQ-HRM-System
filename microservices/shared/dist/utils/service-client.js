"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceClient = void 0;
const axios_1 = __importDefault(require("axios"));
const errors_1 = require("../errors");
class ServiceClient {
    constructor(baseURL, serviceName, timeout = 5000) {
        this.serviceName = serviceName;
        this.client = axios_1.default.create({
            baseURL,
            timeout,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        // Request interceptor to add service metadata
        this.client.interceptors.request.use((config) => {
            config.headers['X-Service-Name'] = this.serviceName;
            config.headers['X-Request-ID'] = '';
            return config;
        });
        // Response interceptor to handle errors
        this.client.interceptors.response.use((response) => response, (error) => {
            const message = error.response?.data?.error?.message || error.message;
            const statusCode = error.response?.status || 500;
            throw new errors_1.ExternalServiceError(`${this.serviceName} service error: ${message}`);
        });
    }
    async get(url, config) {
        const response = await this.client.get(url, config);
        return response.data;
    }
    async post(url, data, config) {
        const response = await this.client.post(url, data, config);
        return response.data;
    }
    async put(url, data, config) {
        const response = await this.client.put(url, data, config);
        return response.data;
    }
    async patch(url, data, config) {
        const response = await this.client.patch(url, data, config);
        return response.data;
    }
    async delete(url, config) {
        const response = await this.client.delete(url, config);
        return response.data;
    }
    // Method to call with authentication
    withAuth(token) {
        return {
            get: (url, config) => this.get(url, { ...config, headers: { ...config?.headers, Authorization: `Bearer ${token}` } }),
            post: (url, data, config) => this.post(url, data, { ...config, headers: { ...config?.headers, Authorization: `Bearer ${token}` } }),
            put: (url, data, config) => this.put(url, data, { ...config, headers: { ...config?.headers, Authorization: `Bearer ${token}` } }),
            patch: (url, data, config) => this.patch(url, data, { ...config, headers: { ...config?.headers, Authorization: `Bearer ${token}` } }),
            delete: (url, config) => this.delete(url, { ...config, headers: { ...config?.headers, Authorization: `Bearer ${token}` } })
        };
    }
}
exports.ServiceClient = ServiceClient;
//# sourceMappingURL=service-client.js.map