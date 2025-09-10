import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        // Verify token and get user data
        const response = await authApi.me();
        setUser(response.user);
      }
    } catch (error) {
      // Token is invalid, remove it
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });

      const { user: userData, accessToken, refreshToken } = response;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(userData);

      toast.success("Welcome back!");
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(userData);

      toast.success(
        "Registration successful! Please check your email to verify your account."
      );
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Even if logout fails on server, we still want to clear local state
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      toast.success("Logged out successfully");
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authApi.forgotPassword(email);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error: any) {
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      await authApi.resetPassword(token, password);
      toast.success(
        "Password reset successful! You can now log in with your new password."
      );
    } catch (error: any) {
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await authApi.verifyEmail(token);
      toast.success("Email verified successfully! You can now log in.");
    } catch (error: any) {
      throw error;
    }
  };

  const resendVerification = async (email: string) => {
    try {
      await authApi.resendVerification(email);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error: any) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
