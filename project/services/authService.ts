import { apiRequest, TokenManager } from "../lib/api";

// Authentication related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  department?: string;
  position?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// Authentication service class
class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiRequest.post<AuthResponse>(
        "/api/v1/auth/login",
        credentials
      );

      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;

        // Store tokens securely
        TokenManager.setTokens(accessToken, refreshToken);

        // Store user data
        localStorage.setItem("hrms_user", JSON.stringify(user));

        return user;
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      // Let the interceptor handle the error display
      throw error;
    }
  }

  /**
   * Logout user and clear all stored data
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate server-side tokens
      await apiRequest.post("/api/v1/auth/logout");
    } catch (error) {
      // Continue with logout even if server call fails
      console.warn("Logout endpoint failed:", error);
    } finally {
      // Always clear local storage
      TokenManager.clearTokens();
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response = await apiRequest.get<User>("/api/v1/auth/profile");

      if (response.success && response.data) {
        // Update stored user data
        localStorage.setItem("hrms_user", JSON.stringify(response.data));
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch profile");
      }
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    try {
      const response = await apiRequest.post(
        "/api/v1/auth/change-password",
        request
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to change password");
      }
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    try {
      const response = await apiRequest.post(
        "/api/v1/auth/forgot-password",
        request
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to send reset email");
      }
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    try {
      const response = await apiRequest.post(
        "/api/v1/auth/reset-password",
        request
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to reset password");
      }
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = TokenManager.getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await apiRequest.post<{
        accessToken: string;
        refreshToken: string;
      }>("/api/v1/auth/refresh", {
        refreshToken,
      });

      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        TokenManager.setTokens(accessToken, newRefreshToken);
        return accessToken;
      } else {
        throw new Error(response.message || "Failed to refresh token");
      }
    } catch (error: any) {
      // Clear tokens if refresh fails
      TokenManager.clearTokens();
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = TokenManager.getAccessToken();
    return token !== null && !TokenManager.isTokenExpired(token);
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem("hrms_user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Clear all authentication data
   */
  clearAuthData(): void {
    TokenManager.clearTokens();
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
export default authService;
