import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management utilities
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = "hrms_access_token";
  private static readonly REFRESH_TOKEN_KEY = "hrms_refresh_token";

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem("hrms_user");
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = TokenManager.getRefreshToken();
      if (refreshToken && !TokenManager.isTokenExpired(refreshToken)) {
        try {
          // Attempt to refresh the token
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/auth/refresh`,
            {
              refreshToken,
            }
          );

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;
          TokenManager.setTokens(accessToken, newRefreshToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          TokenManager.clearTokens();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        // No valid refresh token, clear tokens and redirect to login
        TokenManager.clearTokens();
        window.location.href = "/login";
      }
    }

    // Handle other HTTP errors
    if (error.response) {
      const { status, data } = error.response;
      let errorMessage = "An unexpected error occurred";

      if (data?.message) {
        errorMessage = data.message;
      } else if (data?.error) {
        errorMessage = data.error;
      }

      // Show appropriate error messages
      switch (status) {
        case 400:
          toast.error(`Bad Request: ${errorMessage}`);
          break;
        case 403:
          toast.error(
            "Access denied. You do not have permission to perform this action."
          );
          break;
        case 404:
          toast.error("Resource not found.");
          break;
        case 422:
          toast.error("Validation error. Please check your input.");
          break;
        case 429:
          toast.error("Too many requests. Please try again later.");
          break;
        case 500:
          toast.error("Server error. Please try again later.");
          break;
        default:
          toast.error(errorMessage);
      }
    } else if (error.request) {
      // Network error
      toast.error("Network error. Please check your connection.");
    } else {
      // Something else happened
      toast.error("An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

// Generic API request wrapper
export const apiRequest = {
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> =>
    apiClient.get(url, config).then((response: any) => response.data),

  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> =>
    apiClient.post(url, data, config).then((response: any) => response.data),

  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> =>
    apiClient.put(url, data, config).then((response: any) => response.data),

  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> =>
    apiClient.patch(url, data, config).then((response: any) => response.data),

  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> =>
    apiClient.delete(url, config).then((response: any) => response.data),
};

// Export token manager for use in auth context
export { TokenManager };

// Export the configured axios instance
export default apiClient;
