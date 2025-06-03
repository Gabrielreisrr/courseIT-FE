"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi, setToken, removeToken, getToken } from '@/lib/api';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  register: (name: string, email: string, password: string) => Promise<{success: boolean; error?: string}>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await authApi.getMe();
          if (response.data) {
            setUser(response.data.data);
          } else {
            // Token invalid, clear it
            removeToken();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          removeToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      if (response.error) {
        return { success: false, error: response.error };
      }
      
      if (response.data) {
        setToken(response.data.token);
        setUser(response.data.data);
        
        // Get the redirect path from URL or default to dashboard
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || '/dashboard';
        router.push(redirect);
        
        return { success: true };
      }
      
      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
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
        setUser(response.data.data);
        router.push('/dashboard');
        return { success: true };
      }
      
      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    router.push('/login');
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user && pathname !== '/login' && pathname !== '/register' && !pathname.startsWith('/auth')) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

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

export function withRole(Component: React.ComponentType, allowedRoles: string[]) {
  return function RoleProtectedRoute(props: any) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && (!user || !allowedRoles.includes(user.role))) {
        router.push('/dashboard');
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