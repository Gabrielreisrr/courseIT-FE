"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi, setToken, removeToken, getToken } from "@/lib/api";
import { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();
        if (token) {
          const response = await authApi.getMe();
          if (response.data) {
            setUser(response.data);
          } else {
            removeToken();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", { email });
      const response = await authApi.login(email, password);

      if (response.error) {
        console.error("Login error:", response.error);
        return { success: false, error: response.error };
      }

      if (response.data) {
        console.log("Login successful, setting token and user");
        setToken(response.data.token);
        setUser(response.data.user);

        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect") || "/dashboard";

        window.location.href = redirect;
        return { success: true };
      }

      console.error("Login failed: Unknown error");
      return { success: false, error: "Unknown error occurred" };
    } catch (error) {
      console.error("Login exception:", error);
      return { success: false, error: (error as Error).message };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authApi.register(name, email, password);

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }

      return { success: false, error: "Unknown error occurred" };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function withAuth(Component: React.ComponentType) {
  return function ProtectedRoute(props: any) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!loading && !user) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }, [loading, user, router, pathname]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}

export function withRole(
  Component: React.ComponentType,
  allowedRoles: string[]
) {
  return function RoleProtectedRoute(props: any) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && (!user || !allowedRoles.includes(user.role))) {
        router.push("/dashboard");
      }
    }, [loading, user, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
      );
    }

    if (!user || !allowedRoles.includes(user.role)) {
      return null;
    }

    return <Component {...props} />;
  };
}
