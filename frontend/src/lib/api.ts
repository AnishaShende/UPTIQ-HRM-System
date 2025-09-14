import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { toast } from "sonner";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
              const response = await this.instance.post("/auth/refresh", {
                refreshToken,
              });

              const { accessToken } = response.data;
              localStorage.setItem("accessToken", accessToken);

              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/auth/login";
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        if (error.response?.data?.error?.message) {
          toast.error(error.response.data.error.message);
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred");
        }

        return Promise.reject(error);
      },
    );
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.post(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.instance.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete(url, config);
    return response.data;
  }

  async upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await this.instance.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  }
}

export const apiClient = new ApiClient();

// Export specific API endpoints
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post("/auth/login", credentials),

  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => apiClient.post("/auth/register", userData),

  logout: () => apiClient.post("/auth/logout"),

  me: () => apiClient.get("/auth/me"),

  refreshToken: (refreshToken: string) =>
    apiClient.post("/auth/refresh", { refreshToken }),

  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post("/auth/reset-password", { token, password }),

  verifyEmail: (token: string) =>
    apiClient.post("/auth/verify-email", { token }),

  resendVerification: (email: string) =>
    apiClient.post("/auth/resend-verification", { email }),
};

export const employeeApi = {
  getAll: (params?: any) => apiClient.get("/employees", { params }),
  getById: (id: string) => apiClient.get(`/employees/${id}`),
  create: (data: any) => apiClient.post("/employees", data),
  update: (id: string, data: any) => apiClient.put(`/employees/${id}`, data),
  delete: (id: string) => apiClient.delete(`/employees/${id}`),
  uploadAvatar: (id: string, file: File) =>
    apiClient.upload(`/employees/${id}/avatar`, file),
};

export const departmentApi = {
  getAll: () => apiClient.get("/departments"),
  getById: (id: string) => apiClient.get(`/departments/${id}`),
  create: (data: any) => apiClient.post("/departments", data),
  update: (id: string, data: any) => apiClient.put(`/departments/${id}`, data),
  delete: (id: string) => apiClient.delete(`/departments/${id}`),
};

export const leaveApi = {
  getAll: (params?: any) => apiClient.get("/leave-requests", { params }),
  getById: (id: string) => apiClient.get(`/leave-requests/${id}`),
  create: (data: any) => apiClient.post("/leave-requests", data),
  update: (id: string, data: any) =>
    apiClient.put(`/leave-requests/${id}`, data),
  approve: (id: string) => apiClient.patch(`/leave-requests/${id}/approve`),
  reject: (id: string, reason?: string) =>
    apiClient.patch(`/leave-requests/${id}/reject`, { reason }),
  cancel: (id: string) => apiClient.patch(`/leave-requests/${id}/cancel`),
};

export const payrollApi = {
  getAll: (params?: any) => apiClient.get("/payroll", { params }),
  getById: (id: string) => apiClient.get(`/payroll/${id}`),
  create: (data: any) => apiClient.post("/payroll", data),
  update: (id: string, data: any) => apiClient.put(`/payroll/${id}`, data),
  delete: (id: string) => apiClient.delete(`/payroll/${id}`),
  generatePayslip: (id: string) => apiClient.post(`/payroll/${id}/payslip`),
};

export const attendanceApi = {
  getAll: (params?: any) => apiClient.get("/attendance", { params }),
  getById: (id: string) => apiClient.get(`/attendance/${id}`),
  clockIn: () => apiClient.post("/attendance/clock-in"),
  clockOut: () => apiClient.post("/attendance/clock-out"),
  getMyAttendance: (params?: any) =>
    apiClient.get("/attendance/me", { params }),
};

export const performanceApi = {
  getAll: (params?: any) => apiClient.get("/performance", { params }),
  getById: (id: string) => apiClient.get(`/performance/${id}`),
  create: (data: any) => apiClient.post("/performance", data),
  update: (id: string, data: any) => apiClient.put(`/performance/${id}`, data),
  delete: (id: string) => apiClient.delete(`/performance/${id}`),
};

export const recruitmentApi = {
  getJobs: (params?: any) => apiClient.get("/recruitment/jobs", { params }),
  getJobById: (id: string) => apiClient.get(`/recruitment/jobs/${id}`),
  createJob: (data: any) => apiClient.post("/recruitment/jobs", data),
  updateJob: (id: string, data: any) =>
    apiClient.put(`/recruitment/jobs/${id}`, data),
  deleteJob: (id: string) => apiClient.delete(`/recruitment/jobs/${id}`),

  getApplications: (params?: any) =>
    apiClient.get("/recruitment/applications", { params }),
  getApplicationById: (id: string) =>
    apiClient.get(`/recruitment/applications/${id}`),
  updateApplication: (id: string, data: any) =>
    apiClient.put(`/recruitment/applications/${id}`, data),
};

export const reportsApi = {
  getDashboardStats: () => apiClient.get("/reports/dashboard"),
  getEmployeeReport: (params?: any) =>
    apiClient.get("/reports/employees", { params }),
  getAttendanceReport: (params?: any) =>
    apiClient.get("/reports/attendance", { params }),
  getLeaveReport: (params?: any) => apiClient.get("/reports/leave", { params }),
  getPayrollReport: (params?: any) =>
    apiClient.get("/reports/payroll", { params }),
  exportReport: (type: string, params?: any) =>
    apiClient.get(`/reports/export/${type}`, { params, responseType: "blob" }),
};
