import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, User } from "../../services/authService";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeAuth = async () => {
      setIsLoading(true);

      try {
        // Check if we have valid tokens
        if (authService.isAuthenticated()) {
          // Try to get user from storage first
          const storedUser = authService.getStoredUser();

          if (storedUser) {
            setUser(storedUser);

            // Optionally refresh profile data from server
            try {
              const freshProfile = await authService.getProfile();
              setUser(freshProfile);
            } catch (error) {
              // If profile fetch fails, keep using stored data
              console.warn("Failed to refresh profile:", error);
            }
          } else {
            // No stored user but have tokens, fetch profile
            try {
              const profile = await authService.getProfile();
              setUser(profile);
            } catch (error) {
              // Invalid tokens, clear auth data
              authService.clearAuthData();
            }
          }
        } else {
          // No valid authentication
          authService.clearAuthData();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        authService.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const userData = await authService.login({ email, password });
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await authService.logout();
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if server logout fails
      setUser(null);
      authService.clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const freshProfile = await authService.getProfile();
      setUser(freshProfile);
    } catch (error) {
      console.error("Profile refresh error:", error);
    }
  };

  const isAuthenticated = user !== null && authService.isAuthenticated();

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        refreshProfile,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
